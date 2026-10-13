// Per-device display preferences, stored in localStorage and applied as
// attributes on <html> so plain CSS can react to them:
//   data-hide-amounts  amounts masked (default: on)
//   data-theme         "dark" (default) or "light"
// The server always renders the defaults; PREFERENCES_SCRIPT runs in <head>
// before first paint and applies any saved choice, so the page never flips.
// This module has no 'use client' so the (server) root layout can import it.

export const HIDE_AMOUNTS_KEY = 'hideAmounts';
export const THEME_KEY = 'theme';
export const DARK_THEME_COLOR = '#12110e';
export const LIGHT_THEME_COLOR = '#f6f4ef';

export const PREFERENCES_SCRIPT = `try{var d=document.documentElement;if(localStorage.getItem('${HIDE_AMOUNTS_KEY}')==='0')d.removeAttribute('data-hide-amounts');if(localStorage.getItem('${THEME_KEY}')==='light'){d.setAttribute('data-theme','light');var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content','${LIGHT_THEME_COLOR}')}}catch(e){}`;

const CHANGE_EVENT = 'preference-change';

// For useSyncExternalStore in the toggles.
export function subscribeToPreferences(onChange: () => void) {
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

export function savePreference(key: string, value: string) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Private mode or blocked storage: the change still applies for this visit.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
}
