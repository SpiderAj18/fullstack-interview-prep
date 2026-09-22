# Feature: Category Management (FEAT-010)

## Status

COMPLETED

## Objective

Provide production-ready expense and income categories with system defaults, one-level hierarchy, and archive lifecycle.

## Decisions

| Topic | Choice |
|-------|--------|
| Types | `EXPENSE` and `INCOME` |
| Defaults | Seeded per user on register (`isSystem: true`) |
| Hierarchy | One level (parent → children) |
| Delete | Archive only; reject archiving parent with active children |
| Existing users | Seed on login / list if empty |

## API

All require Bearer access token.

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/v1/categories?type=&includeArchived=` | Tree response |
| POST | `/api/v1/categories` | Create custom |
| PATCH | `/api/v1/categories/:id` | name/color/icon/sortOrder |
| POST | `/api/v1/categories/:id/archive` | Soft archive |
| POST | `/api/v1/categories/:id/unarchive` | Restore |

## Schema

`CategoryType` enum, `parentId`, `isSystem`, `archivedAt`, `icon`, `sortOrder`, indexes for list/filter.
