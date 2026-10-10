'use client';

import { PlusIcon, TrashIcon } from '@/components/icons';
import PageHeader from '@/components/page-header';
import { useToast } from '@/components/toast';
import type { Category, EntryType } from '@/lib/types';
import { useState, useTransition, type FormEvent } from 'react';
import { createCategory, deleteCategory } from './actions';

export default function CategoriesView({ categories }: { categories: Category[] }) {
    const toast = useToast();
    const [pending, startTransition] = useTransition();
    const [name, setName] = useState('');
    const [type, setType] = useState<EntryType>('expense');
    const [color, setColor] = useState('#0f5e57');
    const [error, setError] = useState<string | null>(null);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const result = await createCategory({ name, type, color });
            if (!result.ok) {
                setError(result.error);
                return;
            }
            setError(null);
            setName('');
            toast(result);
        });
    };

    const destroy = (id: number) => {
        if (!confirm('Delete this category? This only works if it has no transactions.')) return;
        startTransition(async () => toast(await deleteCategory(id)));
    };

    const renderList = (title: string, items: Category[]) => (
        <section className="card overflow-hidden">
            <h2 className="flex items-center justify-between border-b border-line px-4 py-3 font-semibold">
                {title}
                <span className="text-xs font-medium text-muted">{items.length}</span>
            </h2>
            <ul className="divide-y divide-line">
                {items.map((c) => (
                    <li key={c.id} className="group flex items-center justify-between px-4 py-2.5 text-sm">
                        <span className="flex items-center gap-3">
                            <span
                                className="grid h-7 w-7 place-items-center rounded-lg text-xs font-bold text-white"
                                style={{ backgroundColor: c.color }}
                            >
                                {c.name.charAt(0)}
                            </span>
                            {c.name}
                        </span>
                        <button
                            onClick={() => destroy(c.id)}
                            className="rounded-lg p-1.5 text-muted transition hover:bg-expense-soft hover:text-expense sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                            aria-label={`Delete ${c.name}`}
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    );

    return (
        <>
            <PageHeader title="Categories" subtitle="Group your transactions so the dashboard can break them down." />

            <form onSubmit={submit} className="card mb-6 p-5">
                <div className="grid grid-cols-[1fr_auto] gap-3 sm:grid-cols-[1fr_10rem_auto_auto]">
                    <div className="col-span-2 sm:col-span-1">
                        <label className="label" htmlFor="name">
                            New category
                        </label>
                        <input
                            id="name"
                            type="text"
                            placeholder="e.g. Coffee"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="field"
                        />
                    </div>
                    <div>
                        <label className="label" htmlFor="type">
                            Type
                        </label>
                        <select
                            id="type"
                            value={type}
                            onChange={(e) => setType(e.target.value as EntryType)}
                            className="field"
                        >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                    </div>
                    <div>
                        <label className="label" htmlFor="color">
                            Color
                        </label>
                        <input
                            id="color"
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="h-[42px] w-14 cursor-pointer rounded-xl border border-line bg-white p-1"
                        />
                    </div>
                    <div className="col-span-2 flex items-end sm:col-span-1">
                        <button type="submit" disabled={pending} className="btn-primary w-full">
                            <PlusIcon className="h-4 w-4" />
                            Add
                        </button>
                    </div>
                </div>
                {error && <p className="mt-2 text-xs font-medium text-expense">{error}</p>}
            </form>

            <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                {renderList(
                    'Expense',
                    categories.filter((c) => c.type === 'expense'),
                )}
                {renderList(
                    'Income',
                    categories.filter((c) => c.type === 'income'),
                )}
            </div>
        </>
    );
}
