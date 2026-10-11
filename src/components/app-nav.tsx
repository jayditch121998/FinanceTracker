'use client';

import { HomeIcon, ListIcon, PiggyIcon, TagIcon, TargetIcon } from '@/components/icons';
import { LinkPendingBar } from '@/components/navigation-progress';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentType, SVGProps } from 'react';

const navItems: { href: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
    { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
    { href: '/transactions', label: 'Transactions', icon: ListIcon },
    { href: '/budgets', label: 'Budgets', icon: TargetIcon },
    { href: '/savings', label: 'Savings', icon: PiggyIcon },
    { href: '/categories', label: 'Categories', icon: TagIcon },
];

function useIsActive() {
    const pathname = usePathname();
    return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

export function TopNav() {
    const isActive = useIsActive();

    return (
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
                    <LinkPendingBar />
                </Link>
            ))}
        </nav>
    );
}

// Bottom tab bar on phones.
export function BottomNav() {
    const isActive = useIsActive();

    return (
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
            <div className="grid grid-cols-5">
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
                        <LinkPendingBar />
                    </Link>
                ))}
            </div>
        </nav>
    );
}
