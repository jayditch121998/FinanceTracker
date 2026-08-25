import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface Category {
    id: number;
    name: string;
    type: 'income' | 'expense';
    color: string;
}

interface Transaction {
    id: number;
    category_id: number;
    type: 'income' | 'expense';
    amount: string;
    date: string;
    note: string | null;
    category: Category;
}

interface Props {
    month: string;
    transactions: Transaction[];
    categories: Category[];
}

function formatCurrency(value: string | number) {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(Number(value));
}

function emptyForm(date: string) {
    return { category_id: '', type: 'expense' as 'income' | 'expense', amount: '', date, note: '' };
}

export default function TransactionsIndex({ month, transactions, categories }: Props) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const today = new Date().toISOString().slice(0, 10);
    const { data, setData, post, patch, reset, processing, errors } = useForm(emptyForm(today));

    const categoriesForType = categories.filter((c) => c.type === data.type);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (editingId) {
            patch(`/transactions/${editingId}`, {
                onSuccess: () => {
                    reset();
                    setEditingId(null);
                },
            });
        } else {
            post('/transactions', { onSuccess: () => reset() });
        }
    };

    const startEdit = (t: Transaction) => {
        setEditingId(t.id);
        setData({ category_id: String(t.category_id), type: t.type, amount: t.amount, date: t.date, note: t.note ?? '' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        reset();
    };

    const destroy = (id: number) => {
        if (confirm('Delete this transaction?')) {
            router.delete(`/transactions/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Transactions" />

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-semibold text-slate-900">Transactions</h1>
                <input
                    type="month"
                    value={month}
                    onChange={(e) => router.get('/transactions', { month: e.target.value })}
                    className="rounded border border-slate-300 px-2 py-1 text-sm"
                />
            </div>

            <form onSubmit={submit} className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="mb-3 text-sm font-medium text-slate-700">
                    {editingId ? 'Edit transaction' : 'Add transaction'}
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    <select
                        value={data.type}
                        onChange={(e) => {
                            const type = e.target.value as 'income' | 'expense';
                            setData((prev) => ({ ...prev, type, category_id: '' }));
                        }}
                        className="rounded border border-slate-300 px-2 py-1.5 text-sm"
                    >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                    </select>

                    <select
                        value={data.category_id}
                        onChange={(e) => setData('category_id', e.target.value)}
                        className="rounded border border-slate-300 px-2 py-1.5 text-sm"
                    >
                        <option value="">Category…</option>
                        {categoriesForType.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="Amount"
                        value={data.amount}
                        onChange={(e) => setData('amount', e.target.value)}
                        className="rounded border border-slate-300 px-2 py-1.5 text-sm"
                    />

                    <input
                        type="date"
                        value={data.date}
                        onChange={(e) => setData('date', e.target.value)}
                        className="rounded border border-slate-300 px-2 py-1.5 text-sm"
                    />

                    <input
                        type="text"
                        placeholder="Note (optional)"
                        value={data.note}
                        onChange={(e) => setData('note', e.target.value)}
                        className="rounded border border-slate-300 px-2 py-1.5 text-sm"
                    />
                </div>

                {(errors.category_id || errors.amount || errors.date) && (
                    <p className="mt-2 text-xs text-red-600">
                        {errors.category_id || errors.amount || errors.date}
                    </p>
                )}

                <div className="mt-3 flex gap-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {editingId ? 'Save changes' : 'Add transaction'}
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                            <th className="px-4 py-2">Date</th>
                            <th className="px-4 py-2">Category</th>
                            <th className="px-4 py-2">Note</th>
                            <th className="px-4 py-2 text-right">Amount</th>
                            <th className="px-4 py-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                                    No transactions for this month yet.
                                </td>
                            </tr>
                        )}
                        {transactions.map((t) => (
                            <tr key={t.id} className="border-t border-slate-100">
                                <td className="px-4 py-2 text-slate-600">{t.date}</td>
                                <td className="px-4 py-2">
                                    <span
                                        className="inline-block h-2 w-2 rounded-full align-middle"
                                        style={{ backgroundColor: t.category.color }}
                                    />{' '}
                                    {t.category.name}
                                </td>
                                <td className="px-4 py-2 text-slate-500">{t.note}</td>
                                <td
                                    className={`px-4 py-2 text-right font-medium ${
                                        t.type === 'income' ? 'text-green-600' : 'text-red-600'
                                    }`}
                                >
                                    {t.type === 'income' ? '+' : '-'}
                                    {formatCurrency(t.amount)}
                                </td>
                                <td className="px-4 py-2 text-right">
                                    <button
                                        onClick={() => startEdit(t)}
                                        className="mr-2 text-xs text-slate-500 hover:text-slate-800"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => destroy(t.id)}
                                        className="text-xs text-red-500 hover:text-red-700"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
