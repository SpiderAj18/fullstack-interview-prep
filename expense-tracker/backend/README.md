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
| POST | `/api/v1/auth/logout` | No | Revoke refresh session (`204`) |

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
- **Category** — user-owned expense categories
- **Expense** — amount (`Decimal(12,2)`), date, optional category, owned by user

## Next Steps

1. Profile (get/update/change password)
2. Category CRUD
3. Expense CRUD with pagination and filters
4. Frontend integration

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
