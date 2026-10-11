export type EntryType = 'income' | 'expense';

export interface Category {
    id: number;
    name: string;
    type: EntryType;
    color: string;
}

export interface Transaction {
    id: number;
    category_id: number;
    type: EntryType;
    amount: number;
    date: string; // Y-m-d
    note: string | null;
    goal_id: number | null;
    category: Category;
    goal: { name: string } | null;
}

export interface Budget {
    category_id: number;
    month: string; // Y-m
    amount: number;
}

export interface SavingsGoal {
    id: number;
    name: string;
    target_amount: number;
    target_date: string | null; // Y-m-d
    color: string;
}

// One deposit (expense) or withdrawal (income) linked to a goal.
export interface GoalMovement {
    goal_id: number;
    type: EntryType;
    amount: number;
}

export type ActionResult = { ok: true; message: string } | { ok: false; error: string };
