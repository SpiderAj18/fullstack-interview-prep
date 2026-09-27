# Expense Tracker Frontend

Next.js 15 (App Router) client for the Expense Tracker API.

## Prerequisites

- Node.js 20+ (22 recommended)
- Backend API running at `http://localhost:3001`
- Backend `CORS_ORIGIN=http://localhost:3000`

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright (scaffold) |
| `npm run format` | Prettier |

## Architecture

```text
UI → feature hooks → TanStack Query → features/*/api → lib/api/client (Axios) → Backend
```

- **Server state:** TanStack Query
- **UI prefs:** Redux Toolkit (sidebar/theme only)
- **Forms:** React Hook Form + Zod
- **Auth tokens:** access in memory, refresh in `sessionStorage` (ADR-F005)

## Routes

| Path | Notes |
|------|-------|
| `/login`, `/register` | Auth |
| `/forgot-password` | Stub (backend FEAT-005 missing) |
| `/dashboard` | Balances + recent activity |
| `/accounts`, `/categories`, `/transactions`, `/budgets` | MVP domain screens |
| `/profile` | Profile + change password |
