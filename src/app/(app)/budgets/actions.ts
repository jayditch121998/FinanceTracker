'use server';

import { databaseError, PG_FOREIGN_KEY_VIOLATION, validationError } from '@/lib/actions';
import { isValidMonth, shiftMonth } from '@/lib/dates';
import { requireUser } from '@/lib/data';
import type { ActionResult } from '@/lib/types';
import { refresh } from 'next/cache';
import { z } from 'zod';

const monthSchema = z.string().refine(isValidMonth, 'Invalid month.');

const budgetSchema = z.object({
    month: monthSchema,
    category_id: z.number().int().positive(),
    // null clears the budget for that category and month.
    amount: z.number().min(0, "A budget can't be negative.").max(9_999_999_999.99, 'That amount is too large.').nullable(),
});

export async function saveBudget(input: z.input<typeof budgetSchema>): Promise<ActionResult> {
    const { supabase } = await requireUser();
    const parsed = budgetSchema.safeParse(input);
    if (!parsed.success) return validationError(parsed.error);

    const { month, category_id, amount } = parsed.data;

    if (amount === null) {
        const { error } = await supabase.from('budgets').delete().match({ month, category_id });
        if (error) return databaseError(error);
        refresh();
        return { ok: true, message: 'Budget cleared.' };
    }

    const { error } = await supabase
        .from('budgets')
        .upsert({ month, category_id, amount }, { onConflict: 'user_id,category_id,month' });
    if (error) {
        return databaseError(error, { [PG_FOREIGN_KEY_VIOLATION]: 'Budgets can only be set on your expense categories.' });
    }

    refresh();
    return { ok: true, message: 'Budget saved.' };
}

export async function copyPreviousBudgets(month: string): Promise<ActionResult> {
    const { supabase } = await requireUser();
    const parsed = monthSchema.safeParse(month);
    if (!parsed.success) return validationError(parsed.error);

    const { data: previous, error: readError } = await supabase
        .from('budgets')
        .select('category_id, amount')
        .eq('month', shiftMonth(parsed.data, -1));
    if (readError) return databaseError(readError);

    // Keep any budgets already set for this month; only fill in the missing ones.
    const { data: copied, error } = await supabase
        .from('budgets')
        .upsert(
            previous.map((b) => ({ category_id: b.category_id, amount: b.amount, month: parsed.data })),
            { onConflict: 'user_id,category_id,month', ignoreDuplicates: true },
        )
        .select('id');
    if (error) return databaseError(error);

    refresh();
    return { ok: true, message: `Copied ${copied.length} budget${copied.length === 1 ? '' : 's'} from last month.` };
}
