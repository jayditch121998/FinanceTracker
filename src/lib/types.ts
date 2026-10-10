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
    category: Category;
}

export interface Budget {
    category_id: number;
    month: string; // Y-m
    amount: number;
}

export type ActionResult = { ok: true; message: string } | { ok: false; error: string };
