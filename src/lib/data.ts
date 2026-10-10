import 'server-only';
import { redirect } from 'next/navigation';
import { monthRange } from './dates';
import { createClient } from './supabase/server';
import type { Budget, Category, Transaction } from './types';

// Every read and every Server Action starts here: it verifies the session
// (getClaims validates the JWT) and returns a client scoped to that user.
export async function requireUser() {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();

    if (!data?.claims) {
        redirect('/login');
    }

    return { supabase, userId: data.claims.sub };
}

export async function getCategories(): Promise<Category[]> {
    const { supabase } = await requireUser();
    const { data, error } = await supabase
        .from('categories')
        .select('id, name, type, color')
        .order('type')
        .order('name');

    if (error) throw error;
    return data;
}

export async function getTransactionsForMonth(month: string): Promise<Transaction[]> {
    const { supabase } = await requireUser();
    const { start, end } = monthRange(month);
    const { data, error } = await supabase
        .from('transactions')
        .select('id, category_id, type, amount, date, note, category:categories(id, name, type, color)')
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: false })
        .order('id', { ascending: false });

    if (error) throw error;
    return data.map((t) => ({ ...t, amount: Number(t.amount) })) as unknown as Transaction[];
}

export async function getBudgetsForMonth(month: string): Promise<Budget[]> {
    const { supabase } = await requireUser();
    const { data, error } = await supabase.from('budgets').select('category_id, month, amount').eq('month', month);

    if (error) throw error;
    return data.map((b) => ({ ...b, amount: Number(b.amount) }));
}

export async function hasBudgetsForMonth(month: string) {
    const { supabase } = await requireUser();
    const { count, error } = await supabase
        .from('budgets')
        .select('id', { count: 'exact', head: true })
        .eq('month', month);

    if (error) throw error;
    return (count ?? 0) > 0;
}
