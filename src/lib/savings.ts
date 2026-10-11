import type { GoalMovement, SavingsGoal } from './types';

export interface GoalProgress {
    id: number;
    name: string;
    color: string;
    target: number;
    targetDate: string | null;
    saved: number;
    remaining: number;
    percent: number;
    reached: boolean;
    // Months from this month through the target date's month, inclusive. Null without a date.
    monthsLeft: number | null;
    // What to save each month to reach the target on time. Null without a date, once reached, or when overdue.
    perMonth: number | null;
    overdue: boolean;
}

const toCents = (value: number) => Math.round(value * 100);

function monthIndex(ym: string) {
    const [year, month] = ym.slice(0, 7).split('-').map(Number);
    return year * 12 + (month - 1);
}

// Deposits (expenses) add to a goal; withdrawals (income) take from it.
export function goalBalances(movements: GoalMovement[]) {
    const cents = new Map<number, number>();
    for (const m of movements) {
        const signed = m.type === 'expense' ? toCents(m.amount) : -toCents(m.amount);
        cents.set(m.goal_id, (cents.get(m.goal_id) ?? 0) + signed);
    }
    return new Map([...cents].map(([goalId, value]) => [goalId, value / 100]));
}

export function buildGoalProgress(goals: SavingsGoal[], movements: GoalMovement[], currentMonth: string): GoalProgress[] {
    const balances = goalBalances(movements);

    return goals.map((goal) => {
        const saved = balances.get(goal.id) ?? 0;
        const remainingCents = Math.max(0, toCents(goal.target_amount) - toCents(saved));
        const reached = remainingCents === 0;
        const monthsLeft = goal.target_date ? monthIndex(goal.target_date) - monthIndex(currentMonth) + 1 : null;
        const overdue = !reached && monthsLeft !== null && monthsLeft < 1;

        return {
            id: goal.id,
            name: goal.name,
            color: goal.color,
            target: goal.target_amount,
            targetDate: goal.target_date,
            saved,
            remaining: remainingCents / 100,
            percent: Math.min(100, Math.max(0, (saved / goal.target_amount) * 100)),
            reached,
            monthsLeft,
            // Round up to the centavo so following the plan always reaches the target.
            perMonth: !reached && monthsLeft !== null && monthsLeft >= 1 ? Math.ceil(remainingCents / monthsLeft) / 100 : null,
            overdue,
        };
    });
}
