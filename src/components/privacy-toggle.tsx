'use client';

import { EyeIcon, EyeOffIcon } from '@/components/icons';
import { HIDE_AMOUNTS_KEY, savePreference, subscribeToPreferences } from '@/lib/preferences';
import { useSyncExternalStore } from 'react';

// Amounts are hidden by default; see lib/preferences.ts for how it's applied.
const isHidden = () => document.documentElement.hasAttribute('data-hide-amounts');

function setHidden(hidden: boolean) {
    document.documentElement.toggleAttribute('data-hide-amounts', hidden);
    savePreference(HIDE_AMOUNTS_KEY, hidden ? '1' : '0');
}

export default function PrivacyToggle() {
    // The server can't see localStorage, so it renders the default: hidden.
    const hidden = useSyncExternalStore(subscribeToPreferences, isHidden, () => true);
    const label = hidden ? 'Show amounts' : 'Hide amounts';

    return (
        <button
            type="button"
            onClick={() => setHidden(!hidden)}
            aria-pressed={hidden}
            aria-label={label}
            title={label}
            className="rounded-lg p-2 text-muted transition hover:bg-surface hover:text-ink"
        >
            {hidden ? <EyeOffIcon className="h-4.5 w-4.5" /> : <EyeIcon className="h-4.5 w-4.5" />}
        </button>
    );
}
