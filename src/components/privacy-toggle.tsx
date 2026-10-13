'use client';

import { EyeIcon, EyeOffIcon } from '@/components/icons';
import { HIDE_AMOUNTS_KEY } from '@/lib/privacy';
import { useSyncExternalStore } from 'react';

// "Hide amounts" lives on <html data-hide-amounts> so plain CSS can mask every
// amount, and in localStorage so it survives reloads on this device. Amounts are
// hidden by default: the server renders the attribute, and the root layout's
// script removes it before first paint only if you chose to show them.
const CHANGE_EVENT = 'hide-amounts-change';

function subscribe(onChange: () => void) {
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

const isHidden = () => document.documentElement.hasAttribute('data-hide-amounts');

function setHidden(hidden: boolean) {
    document.documentElement.toggleAttribute('data-hide-amounts', hidden);
    try {
        localStorage.setItem(HIDE_AMOUNTS_KEY, hidden ? '1' : '0');
    } catch {
        // Private mode or blocked storage: the toggle still works for this visit.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
}

export default function PrivacyToggle() {
    // The server can't see localStorage, so it renders the default: hidden.
    const hidden = useSyncExternalStore(subscribe, isHidden, () => true);
    const label = hidden ? 'Show amounts' : 'Hide amounts';

    return (
        <button
            type="button"
            onClick={() => setHidden(!hidden)}
            aria-pressed={hidden}
            aria-label={label}
            title={label}
            className="rounded-lg p-2 text-muted transition hover:bg-white hover:text-ink"
        >
            {hidden ? <EyeOffIcon className="h-4.5 w-4.5" /> : <EyeIcon className="h-4.5 w-4.5" />}
        </button>
    );
}
