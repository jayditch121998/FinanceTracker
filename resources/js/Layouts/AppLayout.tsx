import { HomeIcon, ListIcon, LogoutIcon, TagIcon, TargetIcon, XIcon } from '@/Components/Icons';
import { Link, router, usePage } from '@inertiajs/react';
import { ComponentType, PropsWithChildren, SVGProps, useEffect, useState } from 'react';

interface PageProps {
    auth: { user: { id: number; name: string; email: string } | null };
    flash: { success?: string | null; error?: string | null };
}

const navItems: { href: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
    { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
    { href: '/transactions', label: 'Transactions', icon: ListIcon },
    { href: '/budgets', label: 'Budgets', icon: TargetIcon },
    { href: '/categories', label: 'Categories', icon: TagIcon },
];

export default function AppLayout({ children }: PropsWithChildren) {
    const { props, url } = usePage<PageProps & Record<string, unknown>>();
    const { auth, flash } = props;
    const isActive = (href: string) => url === href || url.startsWith(`${href}?`) || url.startsWith(`${href}/`);

    // Flash messages show as a toast and fade out on their own. Each visit gives a new flash object.
    const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    useEffect(() => {
        const next = flash.error
            ? { type: 'error' as const, text: flash.error }
            : flash.success
              ? { type: 'success' as const, text: flash.success }
              : null;
        setToast(next);
        if (!next) return;
        const timer = setTimeout(() => setToast(null), next.type === 'error' ? 6000 : 3000);
        return () => clearTimeout(timer);
    }, [flash]);

    return (
        <div className="min-h-screen pb-24 sm:pb-0">
            <header className="sticky top-0 z-20 border-b border-line bg-paper/85 backdrop-blur">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm font-bold text-white">
                            ₱
                        </span>
                        <span className="font-bold tracking-tight">Finance Tracker</span>
                    </Link>

                    <nav className="hidden items-center gap-1 sm:flex">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                                    isActive(item.href) ? 'bg-brand-soft text-brand' : 'text-muted hover:text-ink'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {auth.user && (
                        <div className="flex items-center gap-2 text-sm">
                            <span className="hidden text-muted md:inline">{auth.user.name}</span>
                            <button
                                onClick={() => router.post('/logout')}
                                className="rounded-lg p-2 text-muted transition hover:bg-white hover:text-ink"
                                title="Log out"
                                aria-label="Log out"
                            >
                                <LogoutIcon className="h-4.5 w-4.5" />
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">{children}</main>

            {/* Bottom tab bar on phones. */}
            <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
                <div className="grid grid-cols-4">
                    {navItems.map(({ href, label, icon: NavIcon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                                isActive(href) ? 'text-brand' : 'text-muted'
                            }`}
                        >
                            <NavIcon className="h-5 w-5" />
                            {label}
                        </Link>
                    ))}
                </div>
            </nav>

            {toast && (
                <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30 flex justify-center px-4 sm:bottom-6">
                    <div
                        role="status"
                        className={`pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-lg ${
                            toast.type === 'error' ? 'bg-expense' : 'bg-ink'
                        }`}
                    >
                        {toast.text}
                        <button onClick={() => setToast(null)} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
                            <XIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
