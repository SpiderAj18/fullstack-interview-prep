# Expense Tracker — Backend API

Production-oriented Node.js API for tracking personal expenses.

## Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express 5
- **Database:** PostgreSQL via Prisma ORM
- **Cache / infra:** Redis
- **Local infra:** Docker Compose (`postgres` + `redis`)
- **Validation:** Zod
- **Auth:** JWT (Bearer tokens)

## Architecture

Layered structure following route → controller → service → repository:

```
src/
├── config/        # env + database + redis
├── controllers/   # HTTP handlers
├── middleware/    # auth, errors, request context
├── repositories/  # data access
├── routes/        # route registration
├── services/      # business logic
├── types/         # shared types
└── utils/         # helpers
```

## Getting Started

```bash
# from expense-tracker/
docker compose up -d

cd backend
cp .env.example .env
npm install
npm run db:migrate
npm run dev
```

API runs at `http://localhost:3001`.

Infrastructure defaults:

| Service    | URL |
|------------|-----|
| PostgreSQL | `postgresql://expense:expense@localhost:5432/expense_tracker` |
| Redis      | `redis://localhost:6379` |
| Test DB    | `expense_tracker_test` (created by Compose init script) |

> Prefer `db:migrate` for schema changes. Use `db:push` only for quick local experiments without migration history.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run docker:up` | Start Postgres + Redis (from `backend/`) |
| `npm run docker:down` | Stop Compose services |
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled server |
| `npm run db:push` | Sync Prisma schema to database |
| `npm run db:migrate` | Create/run migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run lint` | Type-check without emit |
| `npm test` | Run API tests |
| `npm run test:watch` | Run tests in watch mode |

## API Endpoints (initial)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | No | API info |
| GET | `/api/v1/health` | No | Health check (DB + Redis) |
| POST | `/api/v1/auth/register` | No | Register; returns access + refresh tokens |
| POST | `/api/v1/auth/login` | No | Login; returns access + refresh tokens |
| POST | `/api/v1/auth/refresh` | No | Rotate access + refresh tokens |
| POST | `/api/v1/auth/logout` | No* | Revoke refresh session (`204`) |
| GET | `/api/v1/auth/me` | Yes | Get current user profile |
| PATCH | `/api/v1/auth/me` | Yes | Update profile (`name`) |
| POST | `/api/v1/auth/change-password` | Yes | Change password (`204`; revokes refresh sessions) |
| GET | `/api/v1/categories` | Yes | List category tree (`?type=&includeArchived=`) |
| POST | `/api/v1/categories` | Yes | Create custom category |
| PATCH | `/api/v1/categories/:id` | Yes | Update name/color/icon/sortOrder |
| POST | `/api/v1/categories/:id/archive` | Yes | Soft-archive category |
| POST | `/api/v1/categories/:id/unarchive` | Yes | Restore archived category |
| GET | `/api/v1/accounts` | Yes | List accounts (`?type=&includeArchived=`) |
| GET | `/api/v1/accounts/:id` | Yes | Get account detail + balances |
| POST | `/api/v1/accounts` | Yes | Create account |
| PATCH | `/api/v1/accounts/:id` | Yes | Update name/color/icon/sortOrder |
| POST | `/api/v1/accounts/:id/archive` | Yes | Soft-archive account |
| POST | `/api/v1/accounts/:id/unarchive` | Yes | Restore archived account |
| GET | `/api/v1/expenses` | Yes | List expenses (filters + pagination) |
| GET | `/api/v1/expenses/:id` | Yes | Get expense detail |
| POST | `/api/v1/expenses` | Yes | Create expense (debits account; optional Idempotency-Key) |
| PATCH | `/api/v1/expenses/:id` | Yes | Update expense (rebalances if needed) |
| POST | `/api/v1/expenses/:id/archive` | Yes | Soft-archive expense (reverses debit) |
| POST | `/api/v1/expenses/:id/unarchive` | Yes | Restore archived expense |
| GET | `/api/v1/incomes` | Yes | List incomes (filters + pagination) |
| GET | `/api/v1/incomes/:id` | Yes | Get income detail |
| POST | `/api/v1/incomes` | Yes | Create income (credits account; optional Idempotency-Key) |
| PATCH | `/api/v1/incomes/:id` | Yes | Update income (rebalances if needed) |
| POST | `/api/v1/incomes/:id/archive` | Yes | Soft-archive income (reverses credit) |
| POST | `/api/v1/incomes/:id/unarchive` | Yes | Restore archived income |
| GET | `/api/v1/transfers` | Yes | List transfers (filters + pagination) |
| GET | `/api/v1/transfers/:id` | Yes | Get transfer detail |
| POST | `/api/v1/transfers` | Yes | Create transfer (debit/credit; optional Idempotency-Key) |
| PATCH | `/api/v1/transfers/:id` | Yes | Update transfer (rebalances if needed) |
| POST | `/api/v1/transfers/:id/archive` | Yes | Soft-archive transfer (reverses both legs) |
| POST | `/api/v1/transfers/:id/unarchive` | Yes | Restore archived transfer |
| GET | `/api/v1/transactions` | Yes | Unified expense/income/transfer history |

\* Logout uses the refresh token in the body, not the access token.

## Auth tokens

* **Access token** — JWT, default TTL `15m` (`JWT_ACCESS_EXPIRES_IN`), sent as `Authorization: Bearer <token>`
* **Refresh token** — opaque, default TTL `7d` (`JWT_REFRESH_EXPIRES_IN`), stored hashed in Redis with rotation + reuse detection

## Postman

Import `postman/Expense-Tracker-API.postman_collection.json` into Postman.

Collection variables:

* `baseUrl` — default `http://localhost:3001`
* `userEmail` / `userPassword` — demo credentials
* `accessToken` / `refreshToken` — set automatically by successful Register/Login/Refresh

## Data Model

- **User** — account with email/password
- **Category** — expense/income, system + custom, one-level hierarchy, archive lifecycle
- **Account** — bank/cash/cards/wallet/UPI, opening + current balance (`Decimal(12,2)`), archive lifecycle
- **Expense** — amount (`Decimal(12,2)`), required account + EXPENSE category, soft archive, balance-linked
- **Income** — amount (`Decimal(12,2)`), required account + INCOME category, soft archive, balance-linked
- **Transfer** — amount between `fromAccountId`/`toAccountId`, not spending, soft archive, balance-linked

## Next Steps

1. Monthly / category budgets
2. Frontend integration

## Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "requestId": "..."
  }
}
```
