import { Link, router, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

interface PageProps {
    auth: { user: { id: number; name: string; email: string } | null };
    flash: { success?: string | null; error?: string | null };
}

const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/transactions', label: 'Transactions' },
    { href: '/categories', label: 'Categories' },
];

export default function AppLayout({ children }: PropsWithChildren) {
    const { auth, flash } = usePage<PageProps & Record<string, unknown>>().props;

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-6">
                        <span className="font-semibold text-slate-900">Finance Tracker</span>
                        <nav className="flex gap-4 text-sm">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="text-slate-600 hover:text-slate-900"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    {auth.user && (
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <span>{auth.user.name}</span>
                            <button
                                onClick={() => router.post('/logout')}
                                className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-100"
                            >
                                Log out
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-6">
                {flash.success && (
                    <div className="mb-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                        {flash.success}
                    </div>
                )}
                {flash.error && (
                    <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                        {flash.error}
                    </div>
                )}
                {children}
            </main>
        </div>
    );
}
