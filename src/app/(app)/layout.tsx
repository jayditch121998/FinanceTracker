import { logout } from '@/app/auth/actions';
import { BottomNav, TopNav } from '@/components/app-nav';
import { LogoutIcon } from '@/components/icons';
import Link from 'next/link';

// Static app chrome. Each page streams its own data in behind a Suspense boundary.
export default function AppLayout({ children }: LayoutProps<'/'>) {
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

                    <TopNav />

                    <form action={logout}>
                        <button
                            className="rounded-lg p-2 text-muted transition hover:bg-white hover:text-ink"
                            title="Log out"
                            aria-label="Log out"
                        >
                            <LogoutIcon className="h-4.5 w-4.5" />
                        </button>
                    </form>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">{children}</main>

            <BottomNav />
        </div>
    );
}
