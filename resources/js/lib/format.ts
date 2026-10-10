const currency = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

export function formatCurrency(value: string | number) {
    return currency.format(Number(value));
}

// Parse Y-m-d as a local date so it never shifts a day across timezones.
export function parseDate(value: string) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
}

export function formatDate(value: string) {
    return parseDate(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatDayHeading(value: string) {
    const date = parseDate(value);
    const today = new Date();
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export function formatMonth(month: string) {
    return parseDate(`${month}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function shiftMonth(month: string, delta: number) {
    const date = parseDate(`${month}-01`);
    date.setMonth(date.getMonth() + delta);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// Today's date as Y-m-d in the user's local timezone (toISOString() would use UTC).
export function todayLocal() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
