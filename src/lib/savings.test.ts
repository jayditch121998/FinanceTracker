import { describe, expect, it } from 'vitest';
import { buildGoalProgress, goalBalances } from './savings';
import type { SavingsGoal } from './types';

const emergency: SavingsGoal = { id: 1, name: 'Emergency fund', target_amount: 50000, target_date: '2027-06-30', color: '#0f5e57' };
const phone: SavingsGoal = { id: 2, name: 'New phone', target_amount: 25000, target_date: null, color: '#a855f7' };

describe('goalBalances', () => {
    it('adds deposits and subtracts withdrawals per goal', () => {
        const balances = goalBalances([
            { goal_id: 1, type: 'expense', amount: 10000 },
            { goal_id: 1, type: 'expense', amount: 0.1 },
            { goal_id: 1, type: 'expense', amount: 0.2 },
            { goal_id: 1, type: 'income', amount: 1500 },
            { goal_id: 2, type: 'expense', amount: 25000 },
        ]);

        expect(balances.get(1)).toBe(8500.3);
        expect(balances.get(2)).toBe(25000);
    });
});

describe('buildGoalProgress', () => {
    it('works out progress and the monthly amount needed to hit the date', () => {
        const [goal] = buildGoalProgress([emergency], [{ goal_id: 1, type: 'expense', amount: 18500 }], '2026-10');

        expect(goal.saved).toBe(18500);
        expect(goal.remaining).toBe(31500);
        expect(goal.percent).toBe(37);
        expect(goal.reached).toBe(false);
        // October 2026 through June 2027 inclusive.
        expect(goal.monthsLeft).toBe(9);
        expect(goal.perMonth).toBe(3500);
        expect(goal.overdue).toBe(false);
    });

    it('rounds the monthly amount up to the centavo', () => {
        const [goal] = buildGoalProgress([{ ...emergency, target_amount: 100 }], [], '2027-04');
        expect(goal.monthsLeft).toBe(3);
        expect(goal.perMonth).toBe(33.34);
    });

    it('marks a goal reached once the target is met, capping the bar at 100%', () => {
        const [goal] = buildGoalProgress([phone], [{ goal_id: 2, type: 'expense', amount: 26000 }], '2026-10');

        expect(goal.reached).toBe(true);
        expect(goal.remaining).toBe(0);
        expect(goal.percent).toBe(100);
        expect(goal.perMonth).toBeNull();
    });

    it('has no monthly amount without a target date', () => {
        const [goal] = buildGoalProgress([phone], [], '2026-10');
        expect(goal.monthsLeft).toBeNull();
        expect(goal.perMonth).toBeNull();
        expect(goal.overdue).toBe(false);
    });

    it('flags an unreached goal whose target month has passed', () => {
        const [goal] = buildGoalProgress([emergency], [], '2027-07');
        expect(goal.overdue).toBe(true);
        expect(goal.perMonth).toBeNull();
    });
});
