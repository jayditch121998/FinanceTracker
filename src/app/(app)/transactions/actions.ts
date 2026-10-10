'use server';

import { databaseError, PG_FOREIGN_KEY_VIOLATION, validationError } from '@/lib/actions';
import { requireUser } from '@/lib/data';
import type { ActionResult } from '@/lib/types';
import { refresh } from 'next/cache';
import { z } from 'zod';

const transactionSchema = z.object({
    category_id: z.coerce.number({ error: 'Choose a category.' }).int().positive('Choose a category.'),
    type: z.enum(['income', 'expense']),
    amount: z.coerce
        .number({ error: 'Enter an amount.' })
        .positive('Enter an amount greater than zero.')
        .max(9_999_999_999.99, 'That amount is too large.'),
    date: z.iso.date('Choose a valid date.'),
    note: z
        .string()
        .trim()
        .max(255, 'Keep the note under 255 characters.')
        .transform((note) => note || null),
});

export type TransactionInput = z.input<typeof transactionSchema>;

const categoryMismatch = {
    [PG_FOREIGN_KEY_VIOLATION]: "That category doesn't exist or doesn't match the transaction type.",
};

export async function createTransaction(input: TransactionInput): Promise<ActionResult> {
    const { supabase } = await requireUser();
    const parsed = transactionSchema.safeParse(input);
    if (!parsed.success) return validationError(parsed.error);

    const { error } = await supabase.from('transactions').insert(parsed.data);
    if (error) return databaseError(error, categoryMismatch);

    refresh();
    return { ok: true, message: 'Transaction added.' };
}

export async function updateTransaction(id: number, input: TransactionInput): Promise<ActionResult> {
    const { supabase } = await requireUser();
    const parsed = transactionSchema.safeParse(input);
    if (!parsed.success) return validationError(parsed.error);

    // RLS limits the update to the user's own rows; zero rows means it isn't theirs.
    const { data, error } = await supabase.from('transactions').update(parsed.data).eq('id', id).select('id');
    if (error) return databaseError(error, categoryMismatch);
    if (data.length === 0) return { ok: false, error: 'Transaction not found.' };

    refresh();
    return { ok: true, message: 'Transaction updated.' };
}

export async function deleteTransaction(id: number): Promise<ActionResult> {
    const { supabase } = await requireUser();

    const { data, error } = await supabase.from('transactions').delete().eq('id', id).select('id');
    if (error) return databaseError(error);
    if (data.length === 0) return { ok: false, error: 'Transaction not found.' };

    refresh();
    return { ok: true, message: 'Transaction deleted.' };
}
