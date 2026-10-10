# Finance Tracker

Personal finance tracker: log income and expenses, see where the money goes, and set
monthly budgets per category. Single user, manual entry only, built for daily use on a phone.

Scope is defined in [docs/v1-scope.md](docs/v1-scope.md), and the decisions behind the stack
are in [docs/adr.md](docs/adr.md). The earlier Laravel + Inertia version is kept at the git
tag `laravel-v1`.

---

## Stack

| Layer    | Tech                                                           |
| -------- | -------------------------------------------------------------- |
| App      | Next.js 16 (App Router, Cache Components), React 19, TypeScript |
| Styling  | Tailwind CSS v4                                                |
| Data     | Supabase Postgres, with Row-Level Security                     |
| Auth     | Supabase Auth (email + password, public signups off)           |
| Hosting  | Vercel (Hobby/free)                                            |
| Tests    | Vitest                                                         |

How the pieces fit:

- **Pages** are Server Components. Each reads its data behind a `<Suspense>` boundary, so the
  page shell loads instantly and the numbers stream in.
- **Changes** (add, edit, delete) are Server Actions in each route's `actions.ts`. Each one
  verifies the session, validates input with zod, and calls `refresh()`.
- **Security** is enforced by the database. Row-Level Security limits every table to the
  signed-in user, and composite foreign keys make sure a transaction's category belongs to the
  same user and type, and that budgets only target your own expense categories.
- **`src/proxy.ts`** (Next 16's name for middleware) refreshes the session cookie and redirects
  signed-out visitors to `/login`.

---

## First-time setup

### 1. Create the Supabase project

1. Create a free project at [supabase.com](https://supabase.com). Pick the Singapore region for
   the lowest latency from the Philippines.
2. Open **SQL Editor**, paste the contents of
   [supabase/migrations/20261010000000_init.sql](supabase/migrations/20261010000000_init.sql)
   and run it. This creates the tables, RLS policies and the default categories trigger.
3. Under **Authentication → Sign In / Providers**, turn off **Allow new users to sign up**.
   This app is for you alone.
4. Under **Authentication → Users**, choose **Add user → Create new user**, enter your email
   and a strong password, and tick **Auto Confirm User**. The default categories are created
   for you automatically.

> Run the migration (step 2) **before** creating the user (step 4), so the trigger can add
> your default categories.

### 2. Run it locally

Requires Node.js 20.9+ (22 recommended).

```bash
npm install
cp .env.example .env.local   # Windows PowerShell: Copy-Item .env.example .env.local
```

Fill in `.env.local` from **Supabase → Project Settings → API Keys**: the project URL and the
publishable key (the legacy `anon` key also works). Then:

```bash
npm run dev
```

Open http://localhost:3000 and log in with the user you created.

### 3. Deploy to Vercel

1. Push the repo to GitHub.
2. In [Vercel](https://vercel.com/new), import the repository. The defaults are correct.
3. Add the two environment variables from `.env.local` under **Environment Variables**.
4. Deploy, then open the URL on your phone. Use "Add to Home Screen" for an app-like icon.
5. In **Supabase → Authentication → URL Configuration**, set **Site URL** to your Vercel URL.

Every push to the production branch redeploys automatically.

---

## Everyday commands

```bash
npm run dev         # local dev server (http://localhost:3000)
npm run typecheck   # generate route types + tsc
npm run lint        # eslint
npm test            # vitest unit tests
npm run build       # production build
```

CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs typecheck, lint, tests and build
on every push and pull request.

---

## Project structure

```
src/
  app/
    (app)/                 signed-in pages, sharing the nav layout
      dashboard/           monthly totals + spending by category vs. budget
      transactions/        add/edit/delete, grouped by day     (+ actions.ts)
      budgets/             monthly limit per expense category  (+ actions.ts)
      categories/          add/delete categories                (+ actions.ts)
    auth/actions.ts        login / logout
    login/                 login page
  components/              nav, month switcher, toasts, icons, skeletons
  lib/
    data.ts                requireUser() + all database reads (server-only)
    summary.ts             pure totals/budget logic (unit tested)
    dates.ts, format.ts    Manila-time dates, ₱ formatting (unit tested)
    supabase/              server + proxy Supabase clients
  proxy.ts                 session refresh + redirect to /login
supabase/migrations/       database schema, RLS and seed trigger
docs/                      scope, decisions, PM log, QA checklist, roadmap
```

Dates: "today" and "this month" are always computed in **Asia/Manila** time
([src/lib/dates.ts](src/lib/dates.ts)), so a transaction logged at 7 AM never lands on
yesterday's date because the server runs in UTC.

---

## Database changes

Add a new file to `supabase/migrations/` (for example `20261101000000_add_x.sql`) and run it
in the Supabase SQL Editor. Never edit a migration that has already been run.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `Missing NEXT_PUBLIC_SUPABASE_URL...` | Create `.env.local` from `.env.example` (locally) or add the variables in Vercel. Restart `npm run dev` after changing it. |
| Login says the credentials don't match | Check the user exists and is confirmed in Supabase → Authentication → Users. |
| Logged in but no categories | The user was created before the migration ran. Delete and re-create the user, or insert categories in the SQL Editor. |
| "Something went wrong" toast | Check the terminal (locally) or Vercel → Logs; the real database error is logged there. |
| Supabase project paused | Free projects pause after about a week without activity. Restore it from the Supabase dashboard. |

---

## Project docs

- [docs/v1-scope.md](docs/v1-scope.md): what's in and out of scope
- [docs/adr.md](docs/adr.md): architecture decisions
- [docs/pm-log.md](docs/pm-log.md): weekly progress log
- [docs/qa-checklist.md](docs/qa-checklist.md): run before calling a milestone done
- [docs/FinanceTracker-Roadmap.xlsx](docs/FinanceTracker-Roadmap.xlsx): features by phase
