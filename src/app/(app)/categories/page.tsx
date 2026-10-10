import PageSkeleton from '@/components/page-skeleton';
import { getCategories } from '@/lib/data';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import CategoriesView from './categories-view';

export const metadata: Metadata = { title: 'Categories' };

export default function CategoriesPage() {
    return (
        <Suspense fallback={<PageSkeleton title="Categories" />}>
            <Categories />
        </Suspense>
    );
}

async function Categories() {
    return <CategoriesView categories={await getCategories()} />;
}
