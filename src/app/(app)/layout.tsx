import { BottomNav, TopNav } from '@/components/app-nav';
import LogoutButton from '@/components/logout-button';
import { NavigationProvider, PendingContent } from '@/components/navigation-progress';
import Link from 'next/link';

// Static app chrome. Each page streams its own data in behind a Suspense boundary.
export default function AppLayout({ children }: LayoutProps<'/'>) {
    return (
        <NavigationProvider>
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

                        <LogoutButton />
                    </div>
                </header>

                <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
                    <PendingContent>{children}</PendingContent>
                </main>

                <BottomNav />
            </div>
        </NavigationProvider>
    );
}
