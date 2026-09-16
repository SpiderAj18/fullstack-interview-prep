# Feature: Refresh Token + Logout (FEAT-003 / FEAT-004)

## Status

COMPLETED

## Objective

Issue short-lived access tokens with rotating Redis-backed refresh tokens, including reuse detection and logout revocation.

## User Story

As a registered user,
I want to refresh my session and log out securely,
so that access tokens can be short-lived without forcing frequent password login.

## Scope

### In Scope

* `refreshToken` returned from register and login
* Access TTL `15m`, refresh TTL `7d`
* Opaque refresh tokens stored in Redis (SHA-256 hashed)
* `POST /api/v1/auth/refresh` with rotation + family revoke on reuse
* `POST /api/v1/auth/logout` to revoke the current refresh session
* Tests + Postman updates

### Out of Scope

* Password recovery / profile
* Cookie-based refresh
* Postgres refresh-token table

## API

### Register / Login response

```json
{
  "user": { "id": "...", "email": "...", "name": null, "createdAt": "..." },
  "accessToken": "...",
  "refreshToken": "..."
}
```

### `POST /api/v1/auth/refresh`

Request:

```json
{ "refreshToken": "..." }
```

Success `200`:

```json
{ "accessToken": "...", "refreshToken": "..." }
```

### `POST /api/v1/auth/logout`

Request:

```json
{ "refreshToken": "..." }
```

Success `204` No Content.

### Errors

| Scenario | Status | Code |
|----------|-------:|------|
| Invalid body | 400 | VALIDATION_ERROR |
| Invalid / expired / reused refresh | 401 | UNAUTHORIZED |

## Approved Decisions

| Decision | Choice |
|----------|--------|
| Access TTL | 15m |
| Refresh TTL | 7d |
| Storage | Redis hashed opaque tokens |
| Refresh body | `{ accessToken, refreshToken }` |
| Logout bundled | Yes |
| Env | `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` |
