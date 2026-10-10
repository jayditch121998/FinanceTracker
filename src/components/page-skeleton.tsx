import PageHeader from '@/components/page-header';

// Fallback shown while a page's data streams in.
export default function PageSkeleton({ title }: { title: string }) {
    return (
        <div aria-busy="true">
            <PageHeader title={title} action={<div className="skeleton h-10 w-48 rounded-xl" />} />
            <div className="skeleton mb-4 h-32" />
            <div className="skeleton h-64" />
        </div>
    );
}
