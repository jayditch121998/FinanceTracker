import { todayInAppTimeZone } from './dates';

const currency = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

export function formatCurrency(value: string | number) {
    return currency.format(Number(value));
}

// Y-m-d strings are formatted as calendar dates in UTC so the day never shifts
// with the viewer's (or server's) time zone.
function utcDate(value: string) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

export function formatDate(value: string) {
    return utcDate(value).toLocaleDateString('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function formatMonth(month: string) {
    return utcDate(`${month}-01`).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' });
}

export function formatDayHeading(value: string, now: Date = new Date()) {
    const today = todayInAppTimeZone(now);
    const yesterday = todayInAppTimeZone(new Date(now.getTime() - 24 * 60 * 60 * 1000));

    if (value === today) return 'Today';
    if (value === yesterday) return 'Yesterday';

    return utcDate(value).toLocaleDateString('en-US', {
        timeZone: 'UTC',
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });
}

