# Expense Tracker — Backend API

Production-oriented Node.js API for tracking personal expenses.

## Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express 5
- **Database:** SQLite (local dev) via Prisma ORM
- **Validation:** Zod
- **Auth:** JWT (Bearer tokens)

## Architecture

Layered structure following route → controller → service → repository:

```
src/
├── config/        # env + database
├── controllers/   # HTTP handlers
├── middleware/    # auth, errors, request context
├── repositories/  # data access (to be added per feature)
├── routes/        # route registration
├── services/      # business logic (to be added per feature)
├── types/         # shared types
└── utils/         # helpers
```

## Getting Started

```bash
cd expense-tracker/backend
cp .env.example .env
npm install
npm run db:push
npm run dev
```

API runs at `http://localhost:3001`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled server |
| `npm run db:push` | Sync Prisma schema to database |
| `npm run db:migrate` | Create/run migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run lint` | Type-check without emit |

## API Endpoints (initial)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | No | API info |
| GET | `/api/v1/health` | No | Health check |

## Data Model

- **User** — account with email/password
- **Category** — user-owned expense categories
- **Expense** — amount, date, optional category, owned by user

## Next Steps

1. Auth routes (`POST /api/v1/auth/register`, `POST /api/v1/auth/login`)
2. Expense CRUD with pagination and filters
3. Category CRUD
4. Integration tests
5. Frontend integration

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
