'use client';

import Money from '@/components/money';
import MonthSwitcher from '@/components/month-switcher';
import PageHeader from '@/components/page-header';
import { Spinner } from '@/components/spinner';
import { useToast } from '@/components/toast';
import type { BudgetRow } from '@/lib/summary';
import { useState, useTransition } from 'react';
import { copyPreviousBudgets, saveBudget } from './actions';

interface Props {
    month: string;
    rows: BudgetRow[];
    canCopyPrevious: boolean;
}

export default function BudgetsView({ month, rows, canCopyPrevious }: Props) {
    const toast = useToast();
    const [copying, startCopy] = useTransition();
    const [saving, startSave] = useTransition();
    const [savingId, setSavingId] = useState<number | null>(null);

    const budgeted = rows.filter((r) => r.budget !== null);
    const totalBudget = budgeted.reduce((sum, r) => sum + (r.budget ?? 0), 0);
    const totalSpent = budgeted.reduce((sum, r) => sum + r.spent, 0);
    const totalLeft = totalBudget - totalSpent;
    const unbudgetedSpent = rows.filter((r) => r.budget === null).reduce((sum, r) => sum + r.spent, 0);

    // Saves on blur; only hits the server when the value actually changed.
    const save = (row: BudgetRow, value: string) => {
        const amount = value.trim() === '' ? null : Number(value);
        if (amount === row.budget || (amount !== null && Number.isNaN(amount))) return;
        setSavingId(row.category_id);
        startSave(async () => {
            toast(await saveBudget({ month, category_id: row.category_id, amount }));
        });
    };

    const copyPrevious = () => startCopy(async () => toast(await copyPreviousBudgets(month)));

    return (
        <>
            <PageHeader
                title="Budgets"
                subtitle="Set a monthly limit per category. Changes save automatically."
                action={<MonthSwitcher month={month} />}
            />

            <div className="card mb-4 grid grid-cols-3 divide-x divide-line">
                <div className="p-4 sm:p-5">
                    <p className="eyebrow">Budgeted</p>
                    <p className="num mt-1 text-lg font-bold sm:text-2xl"><Money value={totalBudget} /></p>
                </div>
                <div className="p-4 sm:p-5">
                    <p className="eyebrow">Spent</p>
                    <p className="num mt-1 text-lg font-bold sm:text-2xl"><Money value={totalSpent} /></p>
                </div>
                <div className="p-4 sm:p-5">
                    <p className="eyebrow">{totalLeft >= 0 ? 'Left' : 'Over'}</p>
                    <p
                        className={`num mt-1 text-lg font-bold sm:text-2xl ${
                            totalLeft >= 0 ? 'text-income' : 'text-expense'
                        }`}
                    >
                        <Money value={Math.abs(totalLeft)} />
                    </p>
                </div>
            </div>

            {canCopyPrevious && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand/20 bg-brand-soft px-4 py-3 text-sm">
                    <span className="font-medium text-brand">No budgets set for this month yet.</span>
                    <button onClick={copyPrevious} disabled={copying} className="btn-primary py-1.5">
                        {copying && <Spinner />}
                        {copying ? 'Copying…' : 'Copy from last month'}
                    </button>
                </div>
            )}

            {rows.length === 0 ? (
                <div className="card px-4 py-12 text-center text-sm text-muted">
                    No expense categories yet. Add some on the Categories page.
                </div>
            ) : (
                <ul className="card divide-y divide-line overflow-hidden">
                    {rows.map((row) => {
                        const left = row.budget === null ? null : row.budget - row.spent;
                        const over = left !== null && left < 0;
                        const percent = row.budget ? Math.min(100, (row.spent / row.budget) * 100) : 0;
                        const isSaving = saving && savingId === row.category_id;

                        return (
                            <li key={row.category_id} className="px-4 py-3.5">
                                <div className="flex items-center gap-3">
                                    <span
                                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                                        style={{ backgroundColor: row.color }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{row.name}</p>
                                        <p className="num text-xs text-muted">
                                            <Money value={row.spent} /> spent
                                            {left !== null && (
                                                <span className={over ? 'font-medium text-expense' : 'text-income'}>
                                                    {' · '}
                                                    <Money value={Math.abs(left)} /> {over ? 'over' : 'left'}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="relative w-32 shrink-0">
                                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted">
                                            {isSaving ? <Spinner className="h-3.5 w-3.5 text-brand" /> : '₱'}
                                        </span>
                                        <input
                                            // Re-mount when the saved value or month changes so the field resets.
                                            key={`${month}-${row.budget}`}
                                            type="number"
                                            inputMode="decimal"
                                            step="0.01"
                                            min="0"
                                            placeholder="No limit"
                                            defaultValue={row.budget ?? ''}
                                            onBlur={(e) => save(row, e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                                            aria-label={`Budget for ${row.name}`}
                                            aria-busy={isSaving}
                                            className="field money-input num py-1.5 pl-7 text-right"
                                        />
                                    </div>
                                </div>
                                {row.budget !== null && (
                                    <div className="mt-2.5 ml-5.5 h-1.5 overflow-hidden rounded-full bg-paper">
                                        <div
                                            className={`h-full rounded-full ${over ? 'bg-expense' : 'bg-brand'}`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}

            {unbudgetedSpent > 0 && (
                <p className="mt-3 px-1 text-xs text-muted">
                    <Money value={unbudgetedSpent} /> spent in categories without a budget.
                </p>
            )}
        </>
    );
}
