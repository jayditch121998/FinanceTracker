# QA Checklist

Run through this before calling v1 (or any milestone) "done".

- [ ] Can log in with the seeded account, and logging out actually blocks access
- [ ] Can add a transaction (both income and expense) and see it reflected in
      the dashboard totals immediately
- [ ] Can edit and delete a transaction
- [ ] Dashboard totals are correct for a month with mixed income/expense entries
- [ ] Category breakdown chart matches the transactions list for the same month
- [ ] Filtering by month works on both Dashboard and Transactions pages
- [ ] Can add and delete a category (delete is blocked if it has transactions)
- [ ] Works on a mobile browser (this is the likely daily-use context)
- [ ] A fresh `composer install && npm install && migrate --seed` on a clean
      checkout works without manual fixes
