# Architecture Decision Log

One entry per real decision, 3-4 lines each. Add new entries at the top.

```
ADR-005: Savings goals; money added to a goal counts as an expense.
A deposit is an expense transaction in "Savings" linked to the goal; a
withdrawal is income in "Savings Withdrawal". Goal balance = deposits -
withdrawals (all time). Chosen so a month's Net reflects money set aside;
trade-off: "Savings" shows up in spending and budgets. Deleting a goal
keeps its transactions and only unlinks them.

ADR-004: Rewrite from Laravel + Inertia to Next.js 16 + Supabase, hosted on
Vercel (overrides "no new framework this round" in docs/v1-scope.md).
Why: the app is small CRUD for one user; Laravel needed a server (Oracle
Free/VPS) or a paid host, while Vercel + Supabase is free with no ops,
backups and auth included. Same features and design, no additions.
Security: Supabase Auth (signups off) + Row-Level Security; composite FKs
keep categories/transactions/budgets consistent per user.
The Laravel version is preserved at git tag laravel-v1.

ADR-003: Build budgets vs. actuals before deploying v1 (overrides the
"use v1 for 2 weeks first" gate in docs/v1-scope.md).
Why: v1 features tested locally; deliberate choice to deploy once the
important features are in, rather than ship the bare v1.
Budgets are per category per month (Y-m), with "copy from last month".

ADR-002: Session-based auth (Laravel's built-in guard), not Sanctum API tokens.
Why: this is a server-rendered Inertia monolith, not a separate API + client.
No API tokens needed for v1 since there's no mobile app this round.
Revisit: only if/when a native mobile app is scoped in (v2+, currently
in the parking lot in docs/v1-scope.md).

ADR-001: Manual entry only for v1, no bank sync.
Why: bank/e-wallet APIs are high effort and high risk of stalling the project.
Revisit: after 2 weeks of real usage with manual entry.
```
