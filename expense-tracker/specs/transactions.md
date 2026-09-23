# Feature: Transaction History (FEAT-015)

## Status

COMPLETED

## Objective

Provide a unified, filterable timeline of expenses, incomes, and transfers without duplicating write APIs.

## Decisions

| Topic | Choice |
|-------|--------|
| Storage | No new table — UNION over Expense / Income / Transfer |
| Writes | Remain on `/expenses`, `/incomes`, `/transfers` |
| Order | `transactionDate DESC`, `id DESC` |
| Transfer + category/merchant filters | Transfers excluded when those filters are set |

## API

Auth required.

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/v1/transactions` | Unified list |

### Query params

`from`, `to`, `type` (`EXPENSE` \| `INCOME` \| `TRANSFER`), `accountId`, `categoryId`, `merchant`, `minAmount`, `maxAmount`, `includeArchived`, `page`, `limit`

### Item shape

Common fields plus type-specific nullable fields (`accountId`, `fromAccountId`/`toAccountId`, `categoryId`, `merchant`, `source`).
