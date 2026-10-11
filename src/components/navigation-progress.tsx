'use client';

import { useLinkStatus } from 'next/link';
import { useRouter } from 'next/navigation';
import { createContext, use, useTransition, type ReactNode } from 'react';

// Thin animated bar pinned to the top of the screen while something loads.
export function TopProgressBar() {
    return (
        <div role="progressbar" aria-label="Loading" className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-brand/15">
            <div className="h-full w-2/5 animate-progress rounded-full bg-brand" />
        </div>
    );
}

// Render inside a <Link>: shows the top bar while that link's navigation is pending.
export function LinkPendingBar() {
    const { pending } = useLinkStatus();
    return pending ? <TopProgressBar /> : null;
}

interface NavigationContextValue {
    pending: boolean;
    navigate: (href: string) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

// Programmatic navigations (like switching months) run in one shared transition,
// so the page can fade its stale content and show the top bar until the new data arrives.
export function NavigationProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    const navigate = (href: string) => startTransition(() => router.push(href, { scroll: false }));

    return <NavigationContext value={{ pending, navigate }}>{children}</NavigationContext>;
}

export function useNavigation() {
    const value = use(NavigationContext);
    if (!value) throw new Error('useNavigation must be used inside <NavigationProvider>');
    return value;
}

// Wraps page content: fades it while a programmatic navigation is in flight.
export function PendingContent({ children }: { children: ReactNode }) {
    const { pending } = useNavigation();

    return (
        <>
            {pending && <TopProgressBar />}
            <div aria-busy={pending} className={`transition-opacity duration-200 ${pending ? 'pointer-events-none opacity-50' : ''}`}>
                {children}
            </div>
        </>
    );
}
