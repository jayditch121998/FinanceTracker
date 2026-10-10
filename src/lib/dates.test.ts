import { describe, expect, it } from 'vitest';
import { currentMonth, monthRange, resolveMonth, shiftMonth, todayInAppTimeZone } from './dates';
import { formatDate, formatDayHeading, formatMonth } from './format';

describe('dates', () => {
    it('uses Manila time for "today", not UTC', () => {
        // 23:30 UTC on Oct 9 is already 07:30 on Oct 10 in Manila.
        const now = new Date('2026-10-09T23:30:00Z');
        expect(todayInAppTimeZone(now)).toBe('2026-10-10');
        expect(currentMonth(new Date('2026-10-31T17:00:00Z'))).toBe('2026-11');
    });

    it('resolves the ?month= query value', () => {
        const now = new Date('2026-10-10T02:00:00Z');
        expect(resolveMonth('2026-02', now)).toBe('2026-02');
        expect(resolveMonth(undefined, now)).toBe('2026-10');
        expect(resolveMonth('2026-13', now)).toBe('2026-10');
        expect(resolveMonth(['2026-02'], now)).toBe('2026-10');
        expect(resolveMonth('garbage', now)).toBe('2026-10');
    });

    it('shifts months across year boundaries', () => {
        expect(shiftMonth('2026-01', -1)).toBe('2025-12');
        expect(shiftMonth('2026-12', 1)).toBe('2027-01');
        expect(shiftMonth('2026-10', 0)).toBe('2026-10');
    });

    it('returns the first and last day of a month', () => {
        expect(monthRange('2026-02')).toEqual({ start: '2026-02-01', end: '2026-02-28' });
        expect(monthRange('2028-02')).toEqual({ start: '2028-02-01', end: '2028-02-29' });
        expect(monthRange('2026-10')).toEqual({ start: '2026-10-01', end: '2026-10-31' });
    });
});

describe('format', () => {
    it('formats dates readably without shifting the day', () => {
        expect(formatDate('2026-02-20')).toBe('February 20, 2026');
        expect(formatMonth('2026-10')).toBe('October 2026');
    });

    it('labels today and yesterday in Manila time', () => {
        const now = new Date('2026-10-09T23:30:00Z'); // Oct 10 in Manila
        expect(formatDayHeading('2026-10-10', now)).toBe('Today');
        expect(formatDayHeading('2026-10-09', now)).toBe('Yesterday');
        expect(formatDayHeading('2026-10-07', now)).toBe('Wednesday, October 7');
    });
});
