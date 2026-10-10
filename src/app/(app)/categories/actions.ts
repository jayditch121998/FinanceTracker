'use server';

import { databaseError, PG_FOREIGN_KEY_VIOLATION, PG_UNIQUE_VIOLATION, validationError } from '@/lib/actions';
import { requireUser } from '@/lib/data';
import type { ActionResult } from '@/lib/types';
import { refresh } from 'next/cache';
import { z } from 'zod';

const categorySchema = z.object({
    name: z.string().trim().min(1, 'Give the category a name.').max(255, 'That name is too long.'),
    type: z.enum(['income', 'expense']),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Pick a color.'),
});

export async function createCategory(input: z.input<typeof categorySchema>): Promise<ActionResult> {
    const { supabase } = await requireUser();
    const parsed = categorySchema.safeParse(input);
    if (!parsed.success) return validationError(parsed.error);

    const { error } = await supabase.from('categories').insert(parsed.data);
    if (error) return databaseError(error, { [PG_UNIQUE_VIOLATION]: 'You already have a category with that name.' });

    refresh();
    return { ok: true, message: 'Category added.' };
}

export async function deleteCategory(id: number): Promise<ActionResult> {
    const { supabase } = await requireUser();

    // The foreign key blocks deleting a category that still has transactions.
    const { data, error } = await supabase.from('categories').delete().eq('id', id).select('id');
    if (error) {
        return databaseError(error, {
            [PG_FOREIGN_KEY_VIOLATION]: 'Cannot delete a category that has transactions.',
        });
    }
    if (data.length === 0) return { ok: false, error: 'Category not found.' };

    refresh();
    return { ok: true, message: 'Category deleted.' };
}
