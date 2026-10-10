# PM Log

Update this every Friday (15 min). Dated, one or two lines per entry —
this is your accountability trail, not a status report for anyone else.

```
2026-10-10 — Rewrote to Next.js 16 + Supabase for free Vercel hosting
(ADR-004). Laravel version tagged laravel-v1. Same features: auth,
transactions, categories, dashboard, budgets vs. actuals. Typecheck, lint,
unit tests, build and DB/RLS checks pass. Next: create Supabase project,
run migration, add user, deploy to Vercel, run QA on phone.

2026-10-09 — Ran v1 locally and tested it. Built budgets vs. actuals and a
mobile-first redesign before deploying (ADR-003).

2026-08-25 — Scope locked (docs/v1-scope.md). Scaffolded fresh project:
Laravel + Inertia + React, auth, categories, transactions, dashboard.
Old FinanceTracker attempt (API + Expo, budgets/bills already built,
never committed) archived as FinanceTracker-old for reference.
Next: composer install, migrate --seed, npm run dev, log in, verify
the QA checklist passes locally.
```
