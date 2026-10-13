'use client';

import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import { shiftMonth } from '@/lib/dates';
import { formatMonth } from '@/lib/format';
import { useNavigation } from '@/components/navigation-progress';
import { usePathname } from 'next/navigation';

export default function MonthSwitcher({ month }: { month: string }) {
    const pathname = usePathname();
    const { pending, navigate } = useNavigation();

    const go = (value: string) => navigate(`${pathname}?month=${value}`);

    return (
        <div
            className={`inline-flex items-center rounded-xl border border-line bg-surface p-1 transition ${
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
