# Feature: Transfers (FEAT-014)

## Status

COMPLETED

## Objective

Move money between a user's accounts without classifying it as spending (BRD Rule 1). Net worth is unchanged; both legs are linked via a single Transfer record.

## Decisions

| Topic | Choice |
|-------|--------|
| Model | Single `Transfer` with `fromAccountId` + `toAccountId` |
| Category | None (transfers are not expense/income) |
| Balance | Debit source + credit destination in same DB transaction |
| Delete | Soft archive with full reverse of both legs |
| Idempotency | Optional `Idempotency-Key` on POST |
| Same-account | Rejected |

## API

All require Bearer access token.

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/v1/transfers` | Filters (`accountId` matches from or to) + pagination |
| GET | `/api/v1/transfers/:id` | Detail |
| POST | `/api/v1/transfers` | Create; optional Idempotency-Key |
| PATCH | `/api/v1/transfers/:id` | Update; rebalance if amount/accounts change |
| POST | `/api/v1/transfers/:id/archive` | Soft archive + reverse |
| POST | `/api/v1/transfers/:id/unarchive` | Restore + re-apply |
