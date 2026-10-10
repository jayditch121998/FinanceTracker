'use client';

import { PencilIcon, PlusIcon, TrashIcon } from '@/components/icons';
import MonthSwitcher from '@/components/month-switcher';
import PageHeader from '@/components/page-header';
import { useToast } from '@/components/toast';
import { todayInAppTimeZone } from '@/lib/dates';
import { formatCurrency, formatDayHeading } from '@/lib/format';
import type { Category, EntryType, Transaction } from '@/lib/types';
import { useState, useTransition, type FormEvent } from 'react';
import { createTransaction, deleteTransaction, updateTransaction } from './actions';

interface Props {
    month: string;
    transactions: Transaction[];
    categories: Category[];
}

interface FormState {
    category_id: string;
    type: EntryType;
    amount: string;
    date: string;
    note: string;
}

function emptyForm(): FormState {
    return { category_id: '', type: 'expense', amount: '', date: todayInAppTimeZone(), note: '' };
}

export default function TransactionsView({ month, transactions, categories }: Props) {
    const toast = useToast();
    const [pending, startTransition] = useTransition();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [error, setError] = useState<string | null>(null);

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((prev) => ({ ...prev, [key]: value }));
    const categoriesForType = categories.filter((c) => c.type === form.type);

    const totalIn = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalOut = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    // Transactions arrive sorted newest first, so grouping preserves that order.
    const byDay = transactions.reduce<Record<string, Transaction[]>>((groups, t) => {
        (groups[t.date] ??= []).push(t);
        return groups;
    }, {});

    const submit = (e: FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const result = editingId ? await updateTransaction(editingId, form) : await createTransaction(form);
            if (!result.ok) {
                setError(result.error);
                return;
            }
            setError(null);
            toast(result);
            if (editingId) {
                setEditingId(null);
                setForm(emptyForm());
            } else {
                // Keep type, category and date so logging several in a row is quick.
                setForm((prev) => ({ ...prev, amount: '', note: '' }));
            }
        });
    };

    const startEdit = (t: Transaction) => {
        setEditingId(t.id);
        setError(null);
        setForm({ category_id: String(t.category_id), type: t.type, amount: String(t.amount), date: t.date, note: t.note ?? '' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setError(null);
        setForm(emptyForm());
    };

    const destroy = (id: number) => {
        if (!confirm('Delete this transaction?')) return;
        startTransition(async () => {
            toast(await deleteTransaction(id));
            if (editingId === id) cancelEdit();
        });
    };

    return (
        <>
            <PageHeader
                title="Transactions"
                subtitle={`${formatCurrency(totalIn)} in · ${formatCurrency(totalOut)} out`}
                action={<MonthSwitcher month={month} />}
            />

            <form onSubmit={submit} className={`card mb-6 p-5 ${editingId ? 'ring-2 ring-brand/30' : ''}`}>
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="font-semibold">{editingId ? 'Edit transaction' : 'New transaction'}</h2>

                    <div className="inline-flex rounded-xl bg-paper p-1 text-sm font-medium" role="radiogroup">
                        {(['expense', 'income'] as const).map((type) => (
                            <button
                                key={type}
                                type="button"
                                role="radio"
                                aria-checked={form.type === type}
                                onClick={() => setForm((prev) => ({ ...prev, type, category_id: '' }))}
                                className={`rounded-lg px-3 py-1 capitalize transition ${
                                    form.type === type
                                        ? `bg-white shadow-sm ${type === 'expense' ? 'text-expense' : 'text-income'}`
                                        : 'text-muted'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="col-span-2 sm:col-span-1">
                        <label className="label" htmlFor="amount">
                            Amount
                        </label>
                        <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted">
                                ₱
                            </span>
                            <input
                                id="amount"
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                min="0.01"
                                placeholder="0.00"
                                value={form.amount}
                                onChange={(e) => set('amount', e.target.value)}
                                className="field num pl-7 font-semibold"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="label" htmlFor="category">
                            Category
                        </label>
                        <select
                            id="category"
                            value={form.category_id}
                            onChange={(e) => set('category_id', e.target.value)}
                            className="field"
                        >
                            <option value="">Choose…</option>
                            {categoriesForType.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="label" htmlFor="date">
                            Date
                        </label>
                        <input
                            id="date"
                            type="date"
                            value={form.date}
                            onChange={(e) => set('date', e.target.value)}
                            className="field"
                        />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                        <label className="label" htmlFor="note">
                            Note
                        </label>
                        <input
                            id="note"
                            type="text"
                            placeholder="Optional"
                            value={form.note}
                            onChange={(e) => set('note', e.target.value)}
                            className="field"
                        />
                    </div>
                </div>

                {error && <p className="mt-3 text-xs font-medium text-expense">{error}</p>}

                <div className="mt-4 flex gap-2">
                    <button type="submit" disabled={pending} className="btn-primary flex-1 sm:flex-none">
                        {!editingId && <PlusIcon className="h-4 w-4" />}
                        {editingId ? 'Save changes' : 'Add transaction'}
                    </button>
                    {editingId && (
                        <button type="button" onClick={cancelEdit} className="btn-ghost">
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {transactions.length === 0 ? (
                <div className="card px-4 py-12 text-center text-sm text-muted">No transactions for this month yet.</div>
            ) : (
                <div className="space-y-5">
                    {Object.entries(byDay).map(([date, items]) => (
                        <section key={date}>
                            <h3 className="eyebrow mb-2 px-1">{formatDayHeading(date)}</h3>
                            <ul className="card divide-y divide-line overflow-hidden">
                                {items.map((t) => (
                                    <li
                                        key={t.id}
                                        className={`group flex items-center gap-3 px-4 py-3 ${
                                            editingId === t.id ? 'bg-brand-soft' : ''
                                        }`}
                                    >
                                        <span
                                            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-bold text-white"
                                            style={{ backgroundColor: t.category.color }}
                                        >
                                            {t.category.name.charAt(0)}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{t.category.name}</p>
                                            {t.note && <p className="truncate text-xs text-muted">{t.note}</p>}
                                        </div>
                                        <span
                                            className={`num shrink-0 text-sm font-semibold ${
                                                t.type === 'income' ? 'text-income' : 'text-ink'
                                            }`}
                                        >
                                            {t.type === 'income' ? '+' : '−'}
                                            {formatCurrency(t.amount)}
                                        </span>
                                        <div className="flex shrink-0 gap-0.5 sm:opacity-0 sm:transition sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                                            <button
                                                onClick={() => startEdit(t)}
                                                className="rounded-lg p-1.5 text-muted hover:bg-paper hover:text-ink"
                                                aria-label="Edit"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => destroy(t.id)}
                                                className="rounded-lg p-1.5 text-muted hover:bg-expense-soft hover:text-expense"
                                                aria-label="Delete"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            )}
        </>
    );
}
