# Feature: Expense Management (FEAT-012)

## Status

COMPLETED

## Objective

Record user expenses against owned accounts and expense categories with correct atomic balance updates.

## Decisions

| Topic | Choice |
|-------|--------|
| Model | Expand `Expense` (defer polymorphic Transaction) |
| Account + category | Both required; category must be `EXPENSE` |
| Balance | Mutate `currentBalance` in same DB transaction |
| Delete | Soft archive with balance reverse |
| Idempotency | Optional `Idempotency-Key` on POST (Redis, 24h) |
| Merchant / tags / paymentMethod | Free string / `String[]` / optional enum |
| Overdraft | Allow negative account balance |

## API

All require Bearer access token.

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/v1/expenses` | Filters + pagination |
| GET | `/api/v1/expenses/:id` | Detail |
| POST | `/api/v1/expenses` | Create + debit; optional Idempotency-Key |
| PATCH | `/api/v1/expenses/:id` | Update; rebalance if amount/account change |
| POST | `/api/v1/expenses/:id/archive` | Soft archive + reverse debit |
| POST | `/api/v1/expenses/:id/unarchive` | Restore + re-debit |

## Schema

`PaymentMethod` enum, required `accountId`/`categoryId`, `transactionDate`, `archivedAt`, `tags String[]`, money as `Decimal(12,2)`.
