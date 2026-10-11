import type { ReactNode } from 'react';

// Fallbacks shown while a page's data streams in. Each one mirrors its page's
// layout so the content drops into place without the page jumping around.

function Bar({ className }: { className: string }) {
    return <div className={`skeleton rounded-md ${className}`} />;
}

const monthSwitcher = <div className="skeleton h-10 w-52 rounded-xl" />;

function Shell({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
    return (
        <div aria-busy="true" aria-label={`Loading ${title}`}>
            {/* Same structure as PageHeader, with a placeholder where the subtitle goes. */}
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    <Bar className="mt-1.5 h-4 w-44" />
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <Shell title="Dashboard" action={monthSwitcher}>
            <div className="card mb-4 grid gap-6 p-5 sm:grid-cols-[1.4fr_1fr_1fr] sm:p-6">
                <div className="space-y-2">
                    <Bar className="h-3 w-28" />
                    <Bar className="h-10 w-48" />
                    <Bar className="h-4 w-56" />
                </div>
                {[0, 1].map((i) => (
                    <div key={i} className="space-y-2 sm:border-l sm:border-line sm:pl-6">
                        <Bar className="h-3 w-16" />
                        <Bar className="h-7 w-32" />
                    </div>
                ))}
            </div>
            <div className="card space-y-5 p-5 sm:p-6">
                <Bar className="h-5 w-32" />
                {[80, 60, 45, 30].map((width) => (
                    <div key={width} className="space-y-2">
                        <div className="flex justify-between">
                            <Bar className="h-4 w-28" />
                            <Bar className="h-4 w-24" />
                        </div>
                        <div className="h-2 rounded-full bg-paper">
                            <div className="skeleton h-2 rounded-full" style={{ width: `${width}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </Shell>
    );
}

function ListRows({ count }: { count: number }) {
    return (
        <ul className="card divide-y divide-line overflow-hidden">
            {Array.from({ length: count }, (_, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-3">
                    <div className="skeleton h-9 w-9 shrink-0 rounded-xl" />
                    <div className="flex-1 space-y-1.5">
                        <Bar className="h-4 w-32" />
                        <Bar className="h-3 w-20" />
                    </div>
                    <Bar className="h-4 w-20" />
                </li>
            ))}
        </ul>
    );
}

export function TransactionsSkeleton() {
    return (
        <Shell title="Transactions" action={monthSwitcher}>
            <div className="card mb-6 p-5">
                <div className="mb-4 flex justify-between">
                    <Bar className="h-5 w-36" />
                    <Bar className="h-8 w-40 rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className={i === 0 || i === 3 ? 'col-span-2 sm:col-span-1' : ''}>
                            <Bar className="mb-1.5 h-3 w-14" />
                            <div className="skeleton h-[42px] rounded-xl" />
                        </div>
                    ))}
                </div>
                <div className="skeleton mt-4 h-10 w-40 rounded-xl" />
            </div>
            <Bar className="mb-2 ml-1 h-3 w-20" />
            <ListRows count={4} />
        </Shell>
    );
}

export function BudgetsSkeleton() {
    return (
        <Shell title="Budgets" action={monthSwitcher}>
            <div className="card mb-4 grid grid-cols-3 divide-x divide-line">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="space-y-2 p-4 sm:p-5">
                        <Bar className="h-3 w-16" />
                        <Bar className="h-7 w-24" />
                    </div>
                ))}
            </div>
            <ul className="card divide-y divide-line overflow-hidden">
                {Array.from({ length: 6 }, (_, i) => (
                    <li key={i} className="flex items-center gap-3 px-4 py-3.5">
                        <div className="skeleton h-2.5 w-2.5 rounded-full" />
                        <div className="flex-1 space-y-1.5">
                            <Bar className="h-4 w-28" />
                            <Bar className="h-3 w-36" />
                        </div>
                        <div className="skeleton h-9 w-32 rounded-xl" />
                    </li>
                ))}
            </ul>
        </Shell>
    );
}

export function SavingsSkeleton() {
    return (
        <Shell title="Savings" action={<div className="skeleton h-10 w-32 rounded-xl" />}>
            <div className="card mb-4 space-y-2 p-5 sm:p-6">
                <Bar className="h-3 w-36" />
                <Bar className="h-10 w-44" />
                <Bar className="h-4 w-40" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[55, 30].map((width) => (
                    <div key={width} className="card space-y-3 p-5">
                        <Bar className="h-5 w-36" />
                        <Bar className="h-7 w-48" />
                        <div className="h-2 rounded-full bg-paper">
                            <div className="skeleton h-2 rounded-full" style={{ width: `${width}%` }} />
                        </div>
                        <Bar className="h-3 w-56" />
                        <div className="flex gap-2 pt-1">
                            <div className="skeleton h-10 flex-1 rounded-xl" />
                            <div className="skeleton h-10 w-14 rounded-xl" />
                            <div className="skeleton h-10 w-20 rounded-xl" />
                        </div>
                    </div>
                ))}
            </div>
        </Shell>
    );
}

export function CategoriesSkeleton() {
    return (
        <Shell title="Categories">
            <div className="card mb-6 h-[106px] p-5">
                <Bar className="mb-1.5 h-3 w-24" />
                <div className="skeleton h-[42px] rounded-xl" />
            </div>
            <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                {[7, 3].map((count) => (
                    <div key={count} className="card overflow-hidden">
                        <div className="border-b border-line px-4 py-3">
                            <Bar className="h-5 w-20" />
                        </div>
                        <ul className="divide-y divide-line">
                            {Array.from({ length: count }, (_, i) => (
                                <li key={i} className="flex items-center gap-3 px-4 py-2.5">
                                    <div className="skeleton h-7 w-7 rounded-lg" />
                                    <Bar className="h-4 w-28" />
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </Shell>
    );
}
