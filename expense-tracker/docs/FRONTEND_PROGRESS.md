# Frontend Progress

Operational board for F0–F7. Detailed IDs live in `FRONTEND_ROADMAP.md` / `FRONTEND_BRD.md`.

| Milestone | Status | Notes |
|-----------|--------|-------|
| F0 Foundation | COMPLETED | Next.js app, Axios client, Query + Redux providers, shared UI, Vitest smoke |
| F1 Authentication | COMPLETED | Register/login/refresh/logout/me/profile/change-password; password recovery BLOCKED (FEAT-005) |
| F2 Application Shell | COMPLETED | Sidebar nav, header, logout, route group layout |
| F3 Dashboard | COMPLETED | Accounts total, recent transactions, budget snapshot (existing APIs only) |
| F4 Categories | COMPLETED | Tree list, create, archive |
| F5 Accounts | COMPLETED | List, create, archive |
| F6 Transactions | COMPLETED | Unified history + expense/income/transfer creates (Idempotency-Key) |
| F7 Budgets | COMPLETED | Monthly budgets, utilization, alerts acknowledge |

## Feature ID snapshot

| ID | Status |
|----|--------|
| FE-F00 | COMPLETED |
| FE-F01–F04, FE-F06 | COMPLETED |
| FE-F05 | BLOCKED |
| FE-F10 | COMPLETED |
| FE-F20 | COMPLETED |
| FE-F30 | COMPLETED |
| FE-F31 | PLANNED (account detail deep-dive deferred) |
| FE-F40, FE-F41, FE-F44, FE-F45 | COMPLETED |
| FE-F42, FE-F43 | COMPLETED |
| FE-F50, FE-F52, FE-F53 | COMPLETED |
| FE-F51 | PARTIAL (create supports category limits via API; UI is total-limit first) |

## Auth token handling (ADR-F005)

| Token | Storage |
|-------|---------|
| Access JWT | In-memory module |
| Refresh | `sessionStorage` |

## Run verification

```bash
cd frontend
npm run typecheck && npm run lint && npm run test && npm run build
```
