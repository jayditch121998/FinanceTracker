# Architecture Decision Log

One entry per real decision, 3-4 lines each. Add new entries at the top.

```
ADR-002: Session-based auth (Laravel's built-in guard), not Sanctum API tokens.
Why: this is a server-rendered Inertia monolith, not a separate API + client.
No API tokens needed for v1 since there's no mobile app this round.
Revisit: only if/when a native mobile app is scoped in (v2+, currently
in the parking lot in docs/v1-scope.md).

ADR-001: Manual entry only for v1, no bank sync.
Why: bank/e-wallet APIs are high effort and high risk of stalling the project.
Revisit: after 2 weeks of real usage with manual entry.
```
