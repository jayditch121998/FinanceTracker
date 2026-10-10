import type { Budget, Category, Transaction } from './types';

export interface CategoryTotal {
    category: string;
    color: string;
    total: number;
    budget: number | null;
}

export interface DashboardSummary {
    totalIncome: number;
    totalExpense: number;
    net: number;
    totalBudget: number | null;
    byCategory: CategoryTotal[];
    transactionCount: number;
}

export interface BudgetRow {
    category_id: number;
    name: string;
    color: string;
    budget: number | null;
    spent: number;
}

// Sum money as integer centavos so totals never pick up floating-point drift.
function sum(values: number[]) {
    return values.reduce((total, value) => total + Math.round(value * 100), 0) / 100;
}

function budgetsByCategory(budgets: Budget[]) {
    return new Map(budgets.map((b) => [b.category_id, Number(b.amount)]));
}

export function buildDashboard(transactions: Transaction[], budgets: Budget[]): DashboardSummary {
    const income = transactions.filter((t) => t.type === 'income');
    const expenses = transactions.filter((t) => t.type === 'expense');
    const totalIncome = sum(income.map((t) => Number(t.amount)));
    const totalExpense = sum(expenses.map((t) => Number(t.amount)));
    const budgetMap = budgetsByCategory(budgets);

    const groups = new Map<number, Transaction[]>();
    for (const t of expenses) {
        groups.set(t.category_id, [...(groups.get(t.category_id) ?? []), t]);
    }

    const byCategory = [...groups.entries()]
        .map(([categoryId, items]) => ({
            category: items[0].category.name,
            color: items[0].category.color,
            total: sum(items.map((t) => Number(t.amount))),
            budget: budgetMap.get(categoryId) ?? null,
        }))
        .sort((a, b) => b.total - a.total);

    return {
        totalIncome,
        totalExpense,
        net: sum([totalIncome, -totalExpense]),
        totalBudget: budgets.length === 0 ? null : sum(budgets.map((b) => Number(b.amount))),
        byCategory,
        transactionCount: transactions.length,
    };
}

export function buildBudgetRows(categories: Category[], transactions: Transaction[], budgets: Budget[]): BudgetRow[] {
    const budgetMap = budgetsByCategory(budgets);

    return categories
        .filter((c) => c.type === 'expense')
        .map((c) => ({
            category_id: c.id,
            name: c.name,
            color: c.color,
            budget: budgetMap.get(c.id) ?? null,
            spent: sum(
                transactions.filter((t) => t.type === 'expense' && t.category_id === c.id).map((t) => Number(t.amount)),
            ),
        }));
}
