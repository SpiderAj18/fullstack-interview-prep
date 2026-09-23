# Feature: Income Management (FEAT-013)

## Status

COMPLETED

## Objective

Record user income against owned accounts and income categories with correct atomic balance credits (BRD Rule 3).

## Decisions

| Topic | Choice |
|-------|--------|
| Model | Separate `Income` table (mirror of Expense) |
| Account + category | Both required; category must be `INCOME` |
| Balance | Credit `currentBalance` in same DB transaction |
| Delete | Soft archive with balance reverse |
| Idempotency | Optional `Idempotency-Key` on POST (Redis, 24h) |
| Source | Optional free-text payer/employer (`source`) |

## API

All require Bearer access token.

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/v1/incomes` | Filters + pagination |
| GET | `/api/v1/incomes/:id` | Detail |
| POST | `/api/v1/incomes` | Create + credit; optional Idempotency-Key |
| PATCH | `/api/v1/incomes/:id` | Update; rebalance if amount/account change |
| POST | `/api/v1/incomes/:id/archive` | Soft archive + reverse credit |
| POST | `/api/v1/incomes/:id/unarchive` | Restore + re-credit |
