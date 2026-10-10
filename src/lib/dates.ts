// The app is used in the Philippines. Server (UTC on Vercel) and browser both
// compute "today" and "this month" in this zone so they always agree.
export const APP_TIME_ZONE = 'Asia/Manila';

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

// Today's date as Y-m-d in the app's time zone.
export function todayInAppTimeZone(now: Date = new Date()) {
    // en-CA formats as YYYY-MM-DD.
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: APP_TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(now);
}

export function currentMonth(now: Date = new Date()) {
    return todayInAppTimeZone(now).slice(0, 7);
}

// Use the ?month= query value when it's a valid Y-m, otherwise this month.
export function resolveMonth(value: string | string[] | undefined, now: Date = new Date()) {
    return typeof value === 'string' && MONTH_PATTERN.test(value) ? value : currentMonth(now);
}

export function isValidMonth(value: string) {
    return MONTH_PATTERN.test(value);
}

export function shiftMonth(month: string, delta: number) {
    const [year, m] = month.split('-').map(Number);
    const index = year * 12 + (m - 1) + delta;
    return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}`;
}

// First and last day of a Y-m month, as Y-m-d strings.
export function monthRange(month: string) {
    const [year, m] = month.split('-').map(Number);
    const lastDay = new Date(Date.UTC(year, m, 0)).getUTCDate();
    return { start: `${month}-01`, end: `${month}-${String(lastDay).padStart(2, '0')}` };
}
