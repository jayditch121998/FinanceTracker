'use client';

import { PencilIcon, PlusIcon, TrashIcon } from '@/components/icons';
import PageHeader from '@/components/page-header';
import { useToast } from '@/components/toast';
import { todayInAppTimeZone } from '@/lib/dates';
import { formatCurrency, formatDate } from '@/lib/format';
import type { GoalProgress } from '@/lib/savings';
import { useState, useTransition, type FormEvent } from 'react';
import { createGoal, deleteGoal, depositToGoal, updateGoal, withdrawFromGoal, type GoalInput } from './actions';

function emptyGoal(): GoalInput {
    return { name: '', target_amount: '', target_date: '', color: '#0f5e57' };
}

export default function SavingsView({ goals }: { goals: GoalProgress[] }) {
    const toast = useToast();
    const [pending, startTransition] = useTransition();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(goals.length === 0);
    const [form, setForm] = useState<GoalInput>(emptyGoal);
    const [error, setError] = useState<string | null>(null);

    const totalSaved = goals.reduce((sum, g) => sum + g.saved, 0);
    const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);

    const closeForm = () => {
        setEditingId(null);
        setShowForm(false);
        setError(null);
        setForm(emptyGoal());
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const result = editingId ? await updateGoal(editingId, form) : await createGoal(form);
            if (!result.ok) {
                setError(result.error);
                return;
            }
            toast(result);
            closeForm();
        });
    };

    const startEdit = (goal: GoalProgress) => {
        setEditingId(goal.id);
        setShowForm(true);
        setError(null);
        setForm({
            name: goal.name,
            target_amount: String(goal.target),
            target_date: goal.targetDate ?? '',
            color: goal.color,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const destroy = (goal: GoalProgress) => {
        const message =
            goal.saved > 0
                ? `Delete "${goal.name}"? Its deposits and withdrawals stay in your transactions but no longer count toward a goal.`
                : `Delete "${goal.name}"?`;
        if (!confirm(message)) return;
        startTransition(async () => {
            toast(await deleteGoal(goal.id));
            if (editingId === goal.id) closeForm();
        });
    };

    return (
        <>
            <PageHeader
                title="Savings"
                subtitle="Money you add to a goal counts as an expense in the month you add it."
                action={
                    !showForm && (
                        <button onClick={() => setShowForm(true)} className="btn-primary">
                            <PlusIcon className="h-4 w-4" />
                            New goal
                        </button>
                    )
                }
            />

            {goals.length > 0 && (
                <div className="card mb-4 p-5 sm:p-6">
                    <p className="eyebrow">Saved across all goals</p>
                    <p className="num mt-1 text-4xl font-bold">{formatCurrency(totalSaved)}</p>
                    <p className="mt-1 text-sm text-muted">
                        of {formatCurrency(totalTarget)} in {goals.length} goal{goals.length === 1 ? '' : 's'}
                    </p>
                </div>
            )}

            {showForm && (
                <form onSubmit={submit} className={`card mb-6 p-5 ${editingId ? 'ring-2 ring-brand/30' : ''}`}>
                    <h2 className="mb-4 font-semibold">{editingId ? 'Edit goal' : 'New savings goal'}</h2>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="label" htmlFor="goal-name">
                                Goal
                            </label>
                            <input
                                id="goal-name"
                                type="text"
                                placeholder="e.g. Emergency fund"
                                value={form.name}
                                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                                className="field"
                            />
                        </div>
                        <div>
                            <label className="label" htmlFor="goal-target">
                                Target
                            </label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted">
                                    ₱
                                </span>
                                <input
                                    id="goal-target"
                                    type="number"
                                    inputMode="decimal"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0.00"
                                    value={String(form.target_amount ?? '')}
                                    onChange={(e) => setForm((prev) => ({ ...prev, target_amount: e.target.value }))}
                                    className="field num pl-7 font-semibold"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="label" htmlFor="goal-date">
                                By (optional)
                            </label>
                            <input
                                id="goal-date"
                                type="date"
                                value={form.target_date ?? ''}
                                onChange={(e) => setForm((prev) => ({ ...prev, target_date: e.target.value }))}
                                className="field"
                            />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="label" htmlFor="goal-color">
                                Color
                            </label>
                            <input
                                id="goal-color"
                                type="color"
                                value={form.color}
                                onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
                                className="h-[42px] w-14 cursor-pointer rounded-xl border border-line bg-white p-1"
                            />
                        </div>
                    </div>

                    {error && <p className="mt-3 text-xs font-medium text-expense">{error}</p>}

                    <div className="mt-4 flex gap-2">
                        <button type="submit" disabled={pending} className="btn-primary flex-1 sm:flex-none">
                            {editingId ? 'Save changes' : 'Create goal'}
                        </button>
                        {(goals.length > 0 || editingId) && (
                            <button type="button" onClick={closeForm} className="btn-ghost">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            )}

            {goals.length === 0 ? (
                <div className="card px-4 py-12 text-center text-sm text-muted">
                    No goals yet. Create one above, like an emergency fund or a trip.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {goals.map((goal) => (
                        <GoalCard
                            key={goal.id}
                            goal={goal}
                            editing={editingId === goal.id}
                            onEdit={() => startEdit(goal)}
                            onDelete={() => destroy(goal)}
                        />
                    ))}
                </div>
            )}
        </>
    );
}

interface GoalCardProps {
    goal: GoalProgress;
    editing: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

function GoalCard({ goal, editing, onEdit, onDelete }: GoalCardProps) {
    const toast = useToast();
    const [pending, startTransition] = useTransition();
    const [amount, setAmount] = useState('');
    const [error, setError] = useState<string | null>(null);

    const move = (direction: 'deposit' | 'withdraw') => {
        startTransition(async () => {
            const input = { goal_id: goal.id, amount, date: todayInAppTimeZone() };
            const result = direction === 'deposit' ? await depositToGoal(input) : await withdrawFromGoal(input);
            if (!result.ok) {
                setError(result.error);
                return;
            }
            setError(null);
            setAmount('');
            toast(result);
        });
    };

    return (
        <section className={`card p-5 ${editing ? 'ring-2 ring-brand/30' : ''}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: goal.color }} />
                    <h2 className="truncate font-semibold">{goal.name}</h2>
                    {goal.reached && (
                        <span className="rounded-md bg-income-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase text-income">
                            Reached
                        </span>
                    )}
                </div>
                <div className="flex shrink-0 gap-0.5">
                    <button
                        onClick={onEdit}
                        className="rounded-lg p-1.5 text-muted hover:bg-paper hover:text-ink"
                        aria-label={`Edit ${goal.name}`}
                    >
                        <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="rounded-lg p-1.5 text-muted hover:bg-expense-soft hover:text-expense"
                        aria-label={`Delete ${goal.name}`}
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <p className="num mt-3">
                <span className="text-2xl font-bold">{formatCurrency(goal.saved)}</span>
                <span className="text-sm text-muted"> / {formatCurrency(goal.target)}</span>
            </p>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-paper">
                <div
                    className="h-full rounded-full transition-[width]"
                    style={{ width: `${goal.percent}%`, backgroundColor: goal.color }}
                />
            </div>

            <p className={`mt-2 text-xs ${goal.overdue ? 'font-medium text-expense' : 'text-muted'}`}>
                {goalStatus(goal)}
            </p>

            <div className="mt-4 flex gap-2">
                <div className="relative min-w-0 flex-1">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted">
                        ₱
                    </span>
                    <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0.01"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        aria-label={`Amount for ${goal.name}`}
                        className="field num py-2 pl-7"
                    />
                </div>
                <button
                    type="button"
                    disabled={pending}
                    onClick={() => move('deposit')}
                    className="btn-primary px-3 py-2"
                >
                    Add
                </button>
                <button
                    type="button"
                    disabled={pending || goal.saved <= 0}
                    onClick={() => move('withdraw')}
                    className="btn-ghost px-3 py-2"
                >
                    Withdraw
                </button>
            </div>

            {error && <p className="mt-2 text-xs font-medium text-expense">{error}</p>}
        </section>
    );
}

function goalStatus(goal: GoalProgress) {
    if (goal.reached) return `Goal reached${goal.saved > goal.target ? `, ${formatCurrency(goal.saved - goal.target)} over` : ''}.`;

    const left = `${formatCurrency(goal.remaining)} to go`;
    if (!goal.targetDate) return `${left}.`;
    if (goal.overdue) return `${left}. The target date (${formatDate(goal.targetDate)}) has passed.`;

    return `${left} by ${formatDate(goal.targetDate)} · save ${formatCurrency(goal.perMonth ?? 0)}/month to stay on track.`;
}
