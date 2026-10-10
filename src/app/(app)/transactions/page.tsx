import PageSkeleton from '@/components/page-skeleton';
import { getCategories, getTransactionsForMonth } from '@/lib/data';
import { resolveMonth } from '@/lib/dates';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import TransactionsView from './transactions-view';

export const metadata: Metadata = { title: 'Transactions' };

export default function TransactionsPage({ searchParams }: PageProps<'/transactions'>) {
    return (
        <Suspense fallback={<PageSkeleton title="Transactions" />}>
            <Transactions searchParams={searchParams} />
        </Suspense>
    );
}

async function Transactions({ searchParams }: Pick<PageProps<'/transactions'>, 'searchParams'>) {
    const month = resolveMonth((await searchParams).month);
    const [transactions, categories] = await Promise.all([getTransactionsForMonth(month), getCategories()]);

    return <TransactionsView month={month} transactions={transactions} categories={categories} />;
}
