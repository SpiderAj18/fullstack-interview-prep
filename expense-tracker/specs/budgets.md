# Feature: Budgeting (FEAT-020 … FEAT-023)

## Status

COMPLETED

## Objective

Let users set a monthly spending budget with optional per-category limits, see live utilization, and receive threshold alerts.

## Decisions

| Topic | Choice |
|-------|--------|
| Period | One active budget per `(userId, year, month)` |
| Category budgets | Optional lines; sum must be ≤ `totalLimit` |
| Child rollup | Parent category budget includes child expense spend |
| Utilization | `spent`, `remaining`, `percentageUsed`, `status` |
| Status | `SAFE` / `WARNING` / `CRITICAL` / `EXCEEDED` |
| Thresholds | Per-budget `warningThreshold` (default 80) and `criticalThreshold` (default 90); 100% = EXCEEDED |
| Alerts | Persisted on read/list when thresholds crossed; unique per `(budget, scope, threshold)`; acknowledge supported |

## API

| Method | Path |
|--------|------|
| GET | `/api/v1/budgets` |
| POST | `/api/v1/budgets` |
| GET | `/api/v1/budgets/:id` |
| PATCH | `/api/v1/budgets/:id` |
| POST | `/api/v1/budgets/:id/archive` |
| POST | `/api/v1/budgets/:id/unarchive` |
| GET | `/api/v1/budgets/:id/alerts` |
| POST | `/api/v1/budgets/:id/alerts/:alertId/acknowledge` |
