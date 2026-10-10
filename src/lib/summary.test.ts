import { describe, expect, it } from 'vitest';
import { buildBudgetRows, buildDashboard } from './summary';
import type { Category, Transaction } from './types';

const groceries: Category = { id: 1, name: 'Groceries', type: 'expense', color: '#22c55e' };
const transport: Category = { id: 2, name: 'Transport', type: 'expense', color: '#0ea5e9' };
const salary: Category = { id: 3, name: 'Salary', type: 'income', color: '#10b981' };

let nextId = 1;
function tx(category: Category, amount: number): Transaction {
    return {
        id: nextId++,
        category_id: category.id,
        type: category.type,
        amount,
        date: '2026-10-05',
        note: null,
        category,
    };
}

describe('buildDashboard', () => {
    it('totals income, expenses and net', () => {
        const summary = buildDashboard([tx(salary, 30000), tx(groceries, 1200), tx(transport, 300)], []);

        expect(summary.totalIncome).toBe(30000);
        expect(summary.totalExpense).toBe(1500);
        expect(summary.net).toBe(28500);
        expect(summary.totalBudget).toBeNull();
        expect(summary.transactionCount).toBe(3);
    });

    it('groups expenses by category, largest first, with their budgets', () => {
        const summary = buildDashboard(
            [tx(transport, 300), tx(groceries, 1200), tx(groceries, 4800), tx(salary, 100)],
            [{ category_id: groceries.id, month: '2026-10', amount: 5000 }],
        );

        expect(summary.totalBudget).toBe(5000);
        expect(summary.byCategory).toEqual([
            { category: 'Groceries', color: '#22c55e', total: 6000, budget: 5000 },
            { category: 'Transport', color: '#0ea5e9', total: 300, budget: null },
        ]);
    });

    it('adds money without floating-point drift', () => {
        expect(buildDashboard([tx(groceries, 0.1), tx(groceries, 0.2)], []).totalExpense).toBe(0.3);
    });
});

describe('buildBudgetRows', () => {
    it('lists every expense category with its budget and spending', () => {
        const rows = buildBudgetRows(
            [groceries, transport, salary],
            [tx(groceries, 1200), tx(groceries, 800), tx(salary, 30000)],
            [{ category_id: groceries.id, month: '2026-10', amount: 5000 }],
        );

        expect(rows).toEqual([
            { category_id: 1, name: 'Groceries', color: '#22c55e', budget: 5000, spent: 2000 },
            { category_id: 2, name: 'Transport', color: '#0ea5e9', budget: null, spent: 0 },
        ]);
    });
});
