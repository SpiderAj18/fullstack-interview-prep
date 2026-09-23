# Feature: Account Management (FEAT-011)

## Status

COMPLETED

## Objective

Provide user-owned financial accounts with balances, system Cash default, and archive lifecycle so later expenses/income/transfers can debit/credit the correct place.

## Decisions

| Topic | Choice |
|-------|--------|
| Types | `BANK`, `CASH`, `CREDIT_CARD`, `DEBIT_CARD`, `WALLET`, `UPI` |
| Defaults | Seed system **Cash** @ `0.00` INR on register |
| Balances | `openingBalance` set on create; `currentBalance` starts equal; no PATCH of balances |
| Type / opening | Immutable after create |
| Delete | Archive only; reject archiving last active account |
| Existing users | Seed on login / list if empty |
| Transaction history | Deferred to FEAT-012 |

## API

All require Bearer access token.

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/v1/accounts?type=&includeArchived=` | List |
| GET | `/api/v1/accounts/:id` | Detail + balances |
| POST | `/api/v1/accounts` | Create (`openingBalance` → both balances) |
| PATCH | `/api/v1/accounts/:id` | name/color/icon/sortOrder |
| POST | `/api/v1/accounts/:id/archive` | Soft archive |
| POST | `/api/v1/accounts/:id/unarchive` | Restore |

## Schema

`AccountType` enum, `Decimal(12,2)` balances, `currency` (ISO 4217), `isSystem`, `archivedAt`, unique `(userId, name)`.
