'use server';

import { databaseError, PG_UNIQUE_VIOLATION, validationError } from '@/lib/actions';
import { getGoalMovements, requireUser } from '@/lib/data';
import { goalBalances } from '@/lib/savings';
import type { ActionResult, EntryType } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { refresh } from 'next/cache';
import { z } from 'zod';

const goalSchema = z.object({
    name: z.string().trim().min(1, 'Give the goal a name.').max(255, 'That name is too long.'),
    target_amount: z.coerce
        .number({ error: 'Enter a target amount.' })
        .positive('Enter a target greater than zero.')
        .max(9_999_999_999.99, 'That amount is too large.'),
    target_date: z.union([z.iso.date('Choose a valid date.'), z.literal('')]).transform((date) => date || null),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Pick a color.'),
});

export type GoalInput = z.input<typeof goalSchema>;

const movementSchema = z.object({
    goal_id: z.number().int().positive(),
    amount: z.coerce
        .number({ error: 'Enter an amount.' })
        .positive('Enter an amount greater than zero.')
        .max(9_999_999_999.99, 'That amount is too large.'),
    date: z.iso.date('Choose a valid date.'),
});

const duplicateName = { [PG_UNIQUE_VIOLATION]: 'You already have a goal with that name.' };

export async function createGoal(input: GoalInput): Promise<ActionResult> {
    const { supabase } = await requireUser();
    const parsed = goalSchema.safeParse(input);
    if (!parsed.success) return validationError(parsed.error);

    const { error } = await supabase.from('savings_goals').insert(parsed.data);
    if (error) return databaseError(error, duplicateName);

    refresh();
    return { ok: true, message: 'Goal created.' };
}

export async function updateGoal(id: number, input: GoalInput): Promise<ActionResult> {
    const { supabase } = await requireUser();
    const parsed = goalSchema.safeParse(input);
    if (!parsed.success) return validationError(parsed.error);

    const { data, error } = await supabase.from('savings_goals').update(parsed.data).eq('id', id).select('id');
    if (error) return databaseError(error, duplicateName);
    if (data.length === 0) return { ok: false, error: 'Goal not found.' };

    refresh();
    return { ok: true, message: 'Goal updated.' };
}

export async function deleteGoal(id: number): Promise<ActionResult> {
    const { supabase } = await requireUser();

    // Linked transactions stay; the foreign key just unlinks them.
    const { data, error } = await supabase.from('savings_goals').delete().eq('id', id).select('id');
    if (error) return databaseError(error);
    if (data.length === 0) return { ok: false, error: 'Goal not found.' };

    refresh();
    return { ok: true, message: 'Goal deleted. Its transactions are still in your history.' };
}

export async function depositToGoal(input: z.input<typeof movementSchema>): Promise<ActionResult> {
    return recordMovement(input, 'expense');
}

export async function withdrawFromGoal(input: z.input<typeof movementSchema>): Promise<ActionResult> {
    return recordMovement(input, 'income');
}

// Deposits are expenses in "Savings"; withdrawals are income in "Savings Withdrawal" (ADR-005).
const movementCategory: Record<EntryType, { name: string; color: string }> = {
    expense: { name: 'Savings', color: '#0f5e57' },
    income: { name: 'Savings Withdrawal', color: '#5e8f89' },
};

async function recordMovement(input: z.input<typeof movementSchema>, type: EntryType): Promise<ActionResult> {
    const { supabase } = await requireUser();
    const parsed = movementSchema.safeParse(input);
    if (!parsed.success) return validationError(parsed.error);

    const { goal_id, amount, date } = parsed.data;

    const { data: goal, error: goalError } = await supabase
        .from('savings_goals')
        .select('name')
        .eq('id', goal_id)
        .maybeSingle();
    if (goalError) return databaseError(goalError);
    if (!goal) return { ok: false, error: 'Goal not found.' };

    if (type === 'income') {
        const balance = goalBalances(await getGoalMovements()).get(goal_id) ?? 0;
        if (amount > balance) {
            return { ok: false, error: `You can withdraw at most ${formatCurrency(balance)} from this goal.` };
        }
    }

    const category = await ensureCategory(type);
    if (!category.ok) return category.result;

    const { error } = await supabase.from('transactions').insert({
        category_id: category.id,
        type,
        amount,
        date,
        goal_id,
    });
    if (error) return databaseError(error);

    refresh();
    return {
        ok: true,
        message:
            type === 'expense'
                ? `Added ${formatCurrency(amount)} to ${goal.name}.`
                : `Withdrew ${formatCurrency(amount)} from ${goal.name}.`,
    };
}

// Find the user's savings category for this direction, creating it on first use.
async function ensureCategory(type: EntryType): Promise<{ ok: true; id: number } | { ok: false; result: ActionResult }> {
    const { supabase } = await requireUser();
    const { name, color } = movementCategory[type];

    const { error: insertError } = await supabase
        .from('categories')
        .upsert({ name, type, color }, { onConflict: 'user_id,name,type', ignoreDuplicates: true });
    if (insertError) return { ok: false, result: databaseError(insertError) };

    const { data, error } = await supabase.from('categories').select('id').match({ name, type }).single();
    if (error) return { ok: false, result: databaseError(error) };

    return { ok: true, id: data.id };
}
