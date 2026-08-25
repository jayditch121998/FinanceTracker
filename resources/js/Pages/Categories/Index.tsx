import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Category {
    id: number;
    name: string;
    type: 'income' | 'expense';
    color: string;
}

interface Props {
    categories: Category[];
}

export default function CategoriesIndex({ categories }: Props) {
    const { data, setData, post, reset, processing, errors } = useForm({
        name: '',
        type: 'expense' as 'income' | 'expense',
        color: '#6366f1',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/categories', { onSuccess: () => reset('name') });
    };

    const destroy = (id: number) => {
        if (confirm('Delete this category? This only works if it has no transactions.')) {
            router.delete(`/categories/${id}`);
        }
    };

    const expense = categories.filter((c) => c.type === 'expense');
    const income = categories.filter((c) => c.type === 'income');

    const renderList = (items: Category[]) => (
        <ul className="divide-y divide-slate-100">
            {items.map((c) => (
                <li key={c.id} className="flex items-center justify-between px-4 py-2 text-sm">
                    <span className="flex items-center gap-2">
                        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.name}
                    </span>
                    <button onClick={() => destroy(c.id)} className="text-xs text-red-500 hover:text-red-700">
                        Delete
                    </button>
                </li>
            ))}
        </ul>
    );

    return (
        <AppLayout>
            <Head title="Categories" />

            <h1 className="mb-6 text-xl font-semibold text-slate-900">Categories</h1>

            <form onSubmit={submit} className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="mb-3 text-sm font-medium text-slate-700">Add category</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <input
                        type="text"
                        placeholder="Name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="rounded border border-slate-300 px-2 py-1.5 text-sm"
                    />
                    <select
                        value={data.type}
                        onChange={(e) => setData('type', e.target.value as 'income' | 'expense')}
                        className="rounded border border-slate-300 px-2 py-1.5 text-sm"
                    >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                    </select>
                    <input
                        type="color"
                        value={data.color}
                        onChange={(e) => setData('color', e.target.value)}
                        className="h-9 w-full rounded border border-slate-300"
                    />
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                        Add
                    </button>
                </div>
                {errors.name && <p className="mt-2 text-xs text-red-600">{errors.name}</p>}
            </form>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-white">
                    <h2 className="border-b border-slate-100 px-4 py-2 text-sm font-medium text-slate-700">Expense</h2>
                    {renderList(expense)}
                </div>
                <div className="rounded-lg border border-slate-200 bg-white">
                    <h2 className="border-b border-slate-100 px-4 py-2 text-sm font-medium text-slate-700">Income</h2>
                    {renderList(income)}
                </div>
            </div>
        </AppLayout>
    );
}
