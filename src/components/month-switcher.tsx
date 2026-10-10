'use client';

import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import { shiftMonth } from '@/lib/dates';
import { formatMonth } from '@/lib/format';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function MonthSwitcher({ month }: { month: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const [pending, startTransition] = useTransition();

    const go = (value: string) => startTransition(() => router.push(`${pathname}?month=${value}`, { scroll: false }));

    return (
        <div
            className={`inline-flex items-center rounded-xl border border-line bg-white p-1 transition ${
                pending ? 'opacity-60' : ''
            }`}
        >
            <button
                type="button"
                onClick={() => go(shiftMonth(month, -1))}
                className="rounded-lg p-1.5 text-muted transition hover:bg-paper hover:text-ink"
                aria-label="Previous month"
            >
                <ChevronLeftIcon className="h-4 w-4" />
            </button>

            {/* The visible label sits on top of a transparent native month input, so tapping it opens the picker. */}
            <label className="relative min-w-32 cursor-pointer px-2 text-center text-sm font-semibold">
                {formatMonth(month)}
                <input
                    type="month"
                    value={month}
                    onChange={(e) => e.target.value && go(e.target.value)}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    aria-label="Choose month"
                />
            </label>

            <button
                type="button"
                onClick={() => go(shiftMonth(month, 1))}
                className="rounded-lg p-1.5 text-muted transition hover:bg-paper hover:text-ink"
                aria-label="Next month"
            >
                <ChevronRightIcon className="h-4 w-4" />
            </button>
        </div>
    );
}
