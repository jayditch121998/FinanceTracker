'use client';

import { logout } from '@/app/auth/actions';
import { LogoutIcon } from '@/components/icons';
import { Spinner } from '@/components/spinner';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            disabled={pending}
            className="rounded-lg p-2 text-muted transition hover:bg-surface hover:text-ink"
            title="Log out"
            aria-label="Log out"
        >
            {pending ? <Spinner className="h-4.5 w-4.5" /> : <LogoutIcon className="h-4.5 w-4.5" />}
        </button>
    );
}

export default function LogoutButton() {
    return (
        <form action={logout}>
            <SubmitButton />
        </form>
    );
}
