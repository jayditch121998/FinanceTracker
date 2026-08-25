import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';

interface CategoryTotal {
    category: string;
    color: string;
    total: number;
}

interface Props {
    month: string;
    totalIncome: number;
    totalExpense: number;
    net: number;
    byCategory: CategoryTotal[];
    transactionCount: number;
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(value);
}

export default function Dashboard({ month, totalIncome, totalExpense, net, byCategory, transactionCount }: Props) {
    const maxCategoryTotal = Math.max(1, ...byCategory.map((c) => c.total));

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
                <input
                    type="month"
                    value={month}
                    onChange={(e) => router.get('/dashboard', { month: e.target.value }, { preserveState: true })}
                    className="rounded border border-slate-300 px-2 py-1 text-sm"
                />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Income</p>
                    <p className="mt-1 text-2xl font-semibold text-green-600">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Expenses</p>
                    <p className="mt-1 text-2xl font-semibold text-red-600">{formatCurrency(totalExpense)}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Net</p>
                    <p className={`mt-1 text-2xl font-semibold ${net >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                        {formatCurrency(net)}
                    </p>
                </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="mb-3 text-sm font-medium text-slate-700">Expenses by category</h2>
                {byCategory.length === 0 ? (
                    <p className="text-sm text-slate-500">
                        No expenses logged for this month yet ({transactionCount} transactions total).
                    </p>
                ) : (
                    <div className="space-y-2">
                        {byCategory.map((c) => (
                            <div key={c.category} className="flex items-center gap-3">
                                <span className="w-32 shrink-0 truncate text-sm text-slate-700">{c.category}</span>
                                <div className="h-4 flex-1 overflow-hidden rounded bg-slate-100">
                                    <div
                                        className="h-4 rounded"
                                        style={{
                                            width: `${(c.total / maxCategoryTotal) * 100}%`,
                                            backgroundColor: c.color,
                                        }}
                                    />
                                </div>
                                <span className="w-24 shrink-0 text-right text-sm text-slate-700">
                                    {formatCurrency(c.total)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
