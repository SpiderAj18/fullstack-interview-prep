# Feature: User Profile (FEAT-006)

## Status

COMPLETED

## Objective

Allow authenticated users to get/update their profile and change their password.

## User Story

As an authenticated user,
I want to view and update my profile and change my password,
so that I can keep my account details current and secure.

## API

### `GET /api/v1/auth/me`

Auth required. Returns `{ user }` including `updatedAt`.

### `PATCH /api/v1/auth/me`

Auth required. Body: `{ "name": "..." }` (empty string clears to `null`).

### `POST /api/v1/auth/change-password`

Auth required. Body: `{ "currentPassword", "newPassword" }`.  
Success: `204`. Revokes all refresh sessions for the user.

## Approved Decisions

| Decision | Choice |
|----------|--------|
| Paths | `/api/v1/auth/me`, `/api/v1/auth/change-password` |
| PATCH fields | `name` only |
| Password change | `204` + revoke all refresh sessions |
| Skip password recovery | Yes |
