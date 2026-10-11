import PageSkeleton from '@/components/page-skeleton';
import { getGoalMovements, getSavingsGoals } from '@/lib/data';
import { currentMonth } from '@/lib/dates';
import { buildGoalProgress } from '@/lib/savings';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import SavingsView from './savings-view';

export const metadata: Metadata = { title: 'Savings' };

export default function SavingsPage() {
    return (
        <Suspense fallback={<PageSkeleton title="Savings" />}>
            <Savings />
        </Suspense>
    );
}

async function Savings() {
    const [goals, movements] = await Promise.all([getSavingsGoals(), getGoalMovements()]);

    return <SavingsView goals={buildGoalProgress(goals, movements, currentMonth())} />;
}
