# Finance Tracker

Personal finance tracker — Laravel + Inertia + React, single-user, manual entry only.
Scope for v1 is defined in `docs/v1-scope.md`. Read that before adding anything not
already listed there.

## Stack

- Laravel 13 (SQLite by default)
- Inertia.js + React 19 + TypeScript
- Tailwind CSS v4

## Getting started

```bash
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
npm install
npm run dev
```

Then in another terminal:

```bash
php artisan serve
```

Visit `http://127.0.0.1:8000`. Seeded login:

- Email: `balansijayditch@gmail.com`
- Password: `password` — **change this after first login** (there's no
  "change password" screen yet in v1; use `php artisan tinker`:
  `User::first()->update(['password' => 'your-new-password']);`)

## What's built (v1 scope)

- Session-based login (single seeded user)
- Categories: seeded defaults (expense + income), add/delete from `/categories`
- Transactions: add/edit/delete, filtered by month, at `/transactions`
- Dashboard: income vs. expense totals and a per-category breakdown for the
  selected month, at `/dashboard`

## What's deliberately not built yet

See "Explicitly out of scope for v1" in `docs/v1-scope.md` — bank/e-wallet
sync, CSV import, budgets, bills, multi-currency, mobile app, reports/export,
multi-user. Don't build these until v1 has been used for real for 2 weeks.

## Project docs

- `docs/v1-scope.md` — the BA one-pager: problem, scope, success criteria
- `docs/pm-log.md` — dated log of what shipped, updated weekly (Friday check-in)
- `docs/adr.md` — short log of real architectural decisions
- `docs/qa-checklist.md` — run this before calling a milestone "done"
