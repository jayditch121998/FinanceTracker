import 'server-only';
import { redirect } from 'next/navigation';
import { monthRange } from './dates';
import { createClient } from './supabase/server';
import type { Budget, Category, GoalMovement, SavingsGoal, Transaction } from './types';

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
        .select(
            'id, category_id, type, amount, date, note, goal_id, category:categories(id, name, type, color), goal:savings_goals(name)',
        )
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

export async function getSavingsGoals(): Promise<SavingsGoal[]> {
    const { supabase } = await requireUser();
    const { data, error } = await supabase
        .from('savings_goals')
        .select('id, name, target_amount, target_date, color')
        .order('created_at');

    if (error) throw error;
    return data.map((g) => ({ ...g, target_amount: Number(g.target_amount) }));
}

// Every transaction linked to a goal, across all months: a goal's balance is
// its lifetime deposits minus withdrawals.
export async function getGoalMovements(): Promise<GoalMovement[]> {
    const { supabase } = await requireUser();
    const { data, error } = await supabase
        .from('transactions')
        .select('goal_id, type, amount')
        .not('goal_id', 'is', null);

    if (error) throw error;
    return data.map((m) => ({ ...m, amount: Number(m.amount) }));
}
