import MonthSwitcher from '@/components/month-switcher';
import PageHeader from '@/components/page-header';
import { DashboardSkeleton } from '@/components/skeletons';
import { getBudgetsForMonth, getTransactionsForMonth } from '@/lib/data';
import { resolveMonth } from '@/lib/dates';
import { formatCurrency } from '@/lib/format';
import { buildDashboard } from '@/lib/summary';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = { title: 'Dashboard' };

export default function DashboardPage({ searchParams }: PageProps<'/dashboard'>) {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <Dashboard searchParams={searchParams} />
        </Suspense>
    );
}

async function Dashboard({ searchParams }: Pick<PageProps<'/dashboard'>, 'searchParams'>) {
    const month = resolveMonth((await searchParams).month);
    const [transactions, budgets] = await Promise.all([getTransactionsForMonth(month), getBudgetsForMonth(month)]);
    const { totalIncome, totalExpense, net, totalBudget, byCategory, transactionCount } = buildDashboard(
        transactions,
        budgets,
    );

    const maxCategoryTotal = Math.max(1, ...byCategory.map((c) => Math.max(c.total, c.budget ?? 0)));
    const keptPercent = totalIncome > 0 ? Math.round((net / totalIncome) * 100) : null;
    const budgetPercent = totalBudget ? Math.min(100, (totalExpense / totalBudget) * 100) : 0;
    const overBudget = totalBudget !== null && totalExpense > totalBudget;

    return (
        <>
            <PageHeader
                title="Dashboard"
                subtitle={`${transactionCount} transaction${transactionCount === 1 ? '' : 's'} this month`}
                action={<MonthSwitcher month={month} />}
            />

            {/* Net leads: it's the one number that answers "how did this month go?" */}
            <div className="card mb-4 overflow-hidden">
                <div className="grid gap-6 p-5 sm:grid-cols-[1.4fr_1fr_1fr] sm:p-6">
                    <div>
                        <p className="eyebrow">Net this month</p>
                        <p className={`num mt-1 text-4xl font-bold ${net < 0 ? 'text-expense' : ''}`}>
                            {formatCurrency(net)}
                        </p>
                        {keptPercent !== null && (
                            <p className="mt-1 text-sm text-muted">
                                {keptPercent >= 0
                                    ? `You kept ${keptPercent}% of what came in.`
                                    : `You spent ${Math.abs(keptPercent)}% more than you earned.`}
                            </p>
                        )}
                    </div>
                    <div className="sm:border-l sm:border-line sm:pl-6">
                        <p className="eyebrow">Income</p>
                        <p className="num mt-1 text-2xl font-semibold text-income">{formatCurrency(totalIncome)}</p>
                    </div>
                    <div className="sm:border-l sm:border-line sm:pl-6">
                        <p className="eyebrow">Expenses</p>
                        <p className="num mt-1 text-2xl font-semibold text-expense">{formatCurrency(totalExpense)}</p>
                        {totalBudget !== null && (
                            <p className={`mt-1 text-xs ${overBudget ? 'font-medium text-expense' : 'text-muted'}`}>
                                of {formatCurrency(totalBudget)} budgeted
                            </p>
                        )}
                    </div>
                </div>
                {totalBudget !== null && (
                    <div className="h-1.5 bg-paper">
                        <div
                            className={`h-full ${overBudget ? 'bg-expense' : 'bg-brand'}`}
                            style={{ width: `${budgetPercent}%` }}
                        />
                    </div>
                )}
            </div>

            <div className="card p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-semibold">Where it went</h2>
                    <Link href={`/budgets?month=${month}`} className="text-sm font-medium text-brand hover:underline">
                        Budgets →
                    </Link>
                </div>

                {byCategory.length === 0 ? (
                    <div className="rounded-xl bg-paper px-4 py-8 text-center">
                        <p className="text-sm text-muted">No expenses logged for this month yet.</p>
                        <Link href="/transactions" className="btn-primary mt-3">
                            Add a transaction
                        </Link>
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {byCategory.map((c) => {
                            const over = c.budget !== null && c.total > c.budget;
                            return (
                                <li key={c.category}>
                                    <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                                        <span className="flex min-w-0 items-center gap-2 font-medium">
                                            <span
                                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                style={{ backgroundColor: c.color }}
                                            />
                                            <span className="truncate">{c.category}</span>
                                            {over && (
                                                <span className="rounded-md bg-expense-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase text-expense">
                                                    Over
                                                </span>
                                            )}
                                        </span>
                                        <span className="num shrink-0">
                                            <span className={`font-semibold ${over ? 'text-expense' : ''}`}>
                                                {formatCurrency(c.total)}
                                            </span>
                                            {c.budget !== null && (
                                                <span className="text-xs text-muted"> / {formatCurrency(c.budget)}</span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="relative h-2 overflow-hidden rounded-full bg-paper">
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${(c.total / maxCategoryTotal) * 100}%`,
                                                backgroundColor: c.color,
                                            }}
                                        />
                                        {/* Tick marking where the budget sits on the same scale. */}
                                        {c.budget !== null && (
                                            <div
                                                className="absolute inset-y-0 w-0.5 bg-ink/60"
                                                style={{ left: `calc(${(c.budget / maxCategoryTotal) * 100}% - 1px)` }}
                                            />
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </>
    );
}
