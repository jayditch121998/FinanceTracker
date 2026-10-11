import { BudgetsSkeleton } from '@/components/skeletons';
import { getBudgetsForMonth, getCategories, getTransactionsForMonth, hasBudgetsForMonth } from '@/lib/data';
import { resolveMonth, shiftMonth } from '@/lib/dates';
import { buildBudgetRows } from '@/lib/summary';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import BudgetsView from './budgets-view';

export const metadata: Metadata = { title: 'Budgets' };

export default function BudgetsPage({ searchParams }: PageProps<'/budgets'>) {
    return (
        <Suspense fallback={<BudgetsSkeleton />}>
            <Budgets searchParams={searchParams} />
        </Suspense>
    );
}

async function Budgets({ searchParams }: Pick<PageProps<'/budgets'>, 'searchParams'>) {
    const month = resolveMonth((await searchParams).month);
    const [categories, transactions, budgets, previousHasBudgets] = await Promise.all([
        getCategories(),
        getTransactionsForMonth(month),
        getBudgetsForMonth(month),
        hasBudgetsForMonth(shiftMonth(month, -1)),
    ]);

    return (
        <BudgetsView
            month={month}
            rows={buildBudgetRows(categories, transactions, budgets)}
            canCopyPrevious={budgets.length === 0 && previousHasBudgets}
        />
    );
}
