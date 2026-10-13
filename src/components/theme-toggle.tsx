'use client';

import { MoonIcon, SunIcon } from '@/components/icons';
import { DARK_THEME_COLOR, LIGHT_THEME_COLOR, savePreference, subscribeToPreferences, THEME_KEY } from '@/lib/preferences';
import { useSyncExternalStore } from 'react';

// Dark is the default; see lib/preferences.ts for how it's applied.
const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';

function setDark(dark: boolean) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    // Keep the phone's browser bar in step with the page.
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
    savePreference(THEME_KEY, dark ? 'dark' : 'light');
}

export default function ThemeToggle() {
    // The server can't see localStorage, so it renders the default: dark.
    const dark = useSyncExternalStore(subscribeToPreferences, isDark, () => true);
    const label = dark ? 'Switch to light mode' : 'Switch to dark mode';

    return (
        <button
            type="button"
            onClick={() => setDark(!dark)}
            aria-label={label}
            title={label}
            className="rounded-lg p-2 text-muted transition hover:bg-surface hover:text-ink"
        >
            {dark ? <SunIcon className="h-4.5 w-4.5" /> : <MoonIcon className="h-4.5 w-4.5" />}
        </button>
    );
}
