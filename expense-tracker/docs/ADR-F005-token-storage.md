# ADR-F005 — Frontend Token Storage

## Status

Accepted (F1)

## Context

Backend auth uses JWT access tokens and opaque refresh tokens returned in JSON bodies. There is no httpOnly cookie refresh endpoint.

## Decision

| Token | Storage | Rationale |
|-------|---------|-----------|
| Access | In-memory module (`lib/auth/tokenStore`) | Minimizes XSS persistence; 15m TTL |
| Refresh | `sessionStorage` | Survives reload within the tab; matches body-based refresh/logout API |

On 401, the Axios client performs a single-flight refresh and retries once. Refresh failure clears tokens and redirects to `/login`.

## Consequences

- Refresh token is XSS-reachable until a cookie/BFF auth change lands on the backend.
- Password recovery UI remains blocked until FEAT-005.
