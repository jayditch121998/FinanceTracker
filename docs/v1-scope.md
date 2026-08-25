# Personal Finance Tracker — v1 Scope (BA One-Pager)

**Owner:** Jayditch (solo — playing all roles)
**Date:** 2026-08-25
**Status:** Draft v1 — lock this before writing any code

---

## Problem

I don't have a clear, current picture of where my money goes. Past attempts (spreadsheet, then a planned Laravel + Expo mobile app) stalled before reaching a usable state, partly because scope kept expanding before v1 ever shipped.

## Goal for v1

Give myself a simple, working way to log income and expenses and see where money is going — nothing more. This is the only goal. Anything else is a v2+ idea.

## Who it's for

Just me. No multi-user auth, no sharing, no household accounts.

## In scope (v1)

- Manual entry of transactions: amount, date, category, note, income or expense
- A fixed, editable list of categories (e.g. Food, Transport, Bills, Freelance Income, etc.)
- A dashboard showing: total income vs. expense for the current month, and a breakdown by category
- Basic list/table view of transactions with filter by month
- Edit and delete a transaction
- Single-user login (just enough auth to keep it private, e.g. one seeded account)

## Explicitly out of scope for v1 (parking lot — do not build yet)

- Bank / e-wallet API sync (GCash, banks, etc.)
- CSV import
- Budgets vs. actuals
- Multi-currency
- Recurring transactions / bills reminders
- Net worth / account balance tracking
- Mobile app (Expo or otherwise) — web only for v1
- Reports/export (PDF, Excel)
- Multi-user / household sharing

Revisit this list only after v1 is deployed and you've used it for real for at least 2 weeks.

## Stack

Laravel + React/Inertia — the stack I already ship fast in at work. No new framework this round.

## Success criteria for v1

- Deployed somewhere I can reach from my phone browser
- I log at least one real transaction per day for 2 consecutive weeks without giving up
- I can answer "how much did I spend on X this month?" by looking at the dashboard, not by guessing

## Definition of done for v1

- [ ] All "in scope" items above are built and working
- [ ] Deployed (even to a cheap VPS or free-tier host)
- [ ] I've personally used it daily for 14 days
- [ ] QA checklist (below) passes

---

## Companion artifacts (fill these in as you go — don't over-invest upfront)

### PM Log (update weekly, dated entries)
```
2026-08-25 — Scope locked (this doc). Next: DB schema + auth scaffold.
```

### ADR Log (one entry per real decision, 3-4 lines each)
```
ADR-001: Manual entry only for v1, no bank sync.
Why: bank/e-wallet APIs are high effort and high risk of stalling the project.
Revisit: after 2 weeks of real usage with manual entry.
```

### QA Checklist (run before calling v1 "done")
- [ ] Can add a transaction and see it reflected in the dashboard total immediately
- [ ] Can edit and delete a transaction
- [ ] Dashboard totals are correct for a month with mixed income/expense entries
- [ ] Filtering by month works
- [ ] Auth blocks access when logged out
- [ ] Works on mobile browser (since that's likely daily-use context)

### Wireframes
Not included here — sketch these in Excalidraw or on paper before building the dashboard and entry form screens.

---

**Friday check-in ritual:** every Friday, spend 15 minutes updating the PM Log and asking "did scope creep in this week?" If yes, move it to the parking lot above.
