# Feature: User Login

## 1. Requirement

### Problem

Users can register and receive a JWT, but cannot authenticate again later with email/password.

### Goal

Allow an existing user to log in with email and password and receive the same auth response shape as registration (`user` + `accessToken`).

### User Story

As a **registered user**, I want to **log in with my email and password** so that **I can obtain an access token and use protected APIs**.

---

# 2. Scope

## In Scope

* `POST /api/v1/auth/login` (public)
* Zod validation for email + password
* Lookup user by normalized email via `userRepository.findByEmail`
* Verify password with existing `comparePassword`
* Issue JWT via `signAccessToken`
* Return `{ user, accessToken }` without password/hash
* Generic failure for unknown email or wrong password → `401 UNAUTHORIZED`
* Dummy password hash compare when user is missing (timing mitigation)
* Vitest API tests
* Postman collection covering register + login

## Out of Scope

* Refresh tokens / logout / session store
* Password reset / email verification
* Rate limiting / lockout
* Frontend
* Schema/migration changes
* Changing register behavior

---

# 3. Existing Code Analysis

## Related Features

* User Registration — dominant pattern extended for login

## Reusable Components

* `userRepository.findByEmail`
* `comparePassword`
* `signAccessToken` / `AuthPayload`
* Public user mapper in `authService`
* `UnauthorizedError`
* Global `errorHandler`

---

# 4. API Design

### Method

`POST /api/v1/auth/login`

### Authentication

Not required (public)

### Request

```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

### Success Response

`200 OK`

```json
{
  "user": {
    "id": "clx...",
    "email": "jane@example.com",
    "name": "Jane",
    "createdAt": "2026-09-15T18:00:00.000Z"
  },
  "accessToken": "<jwt>"
}
```

### Error Cases

| Scenario | Status | Error Code |
|----------|-------:|------------|
| Invalid / missing body | 400 | VALIDATION_ERROR |
| Unknown email | 401 | UNAUTHORIZED |
| Wrong password | 401 | UNAUTHORIZED |
| Unhandled failure | 500 | INTERNAL_SERVER_ERROR |

Same message for unknown email and wrong password: `"Invalid email or password"`.

---

# 5. Database Changes

None.

---

# 6. Business Logic

```text
POST /api/v1/auth/login
  ↓
Controller: loginBodySchema.parse(body)
  ↓
Service:
  normalize email
  findByEmail
  comparePassword against user hash or dummy hash
  if !user or !match → UnauthorizedError
  signAccessToken
  return { user, accessToken }
  ↓
Controller: 200 + JSON
```

---

# 7. Authorization & Ownership

N/A for login. Token claims `{ userId, email }` enable ownership on later protected routes.

---

# 8. Validation

| Field | Rules |
|-------|--------|
| `email` | required, trim, email, max 255 |
| `password` | required, min 8, max 72 |

`loginBodySchema` with `.strict()`.

---

# 9. Error Handling

* Zod → 400 via global handler
* Invalid credentials → `UnauthorizedError("Invalid email or password")`

---

# 10. Files

## New Files

| File | Responsibility |
|------|----------------|
| `specs/user-login.md` | This specification |
| `backend/src/test/auth.login.test.ts` | Login API tests |
| `backend/postman/Expense-Tracker-API.postman_collection.json` | Auth Postman requests |

## Modified Files

| File | Change |
|------|--------|
| `backend/src/validators/authSchemas.ts` | Add `loginBodySchema` |
| `backend/src/utils/password.ts` | Export dummy hash for timing-safe compare |
| `backend/src/services/authService.ts` | Add `login`; share public-user type |
| `backend/src/controllers/authController.ts` | Add `login` |
| `backend/src/routes/authRoutes.ts` | `POST /login` |
| `backend/README.md` | Document login endpoint |

---

# 11. Testing Strategy

* Register then login → `200`, token claims match
* Wrong password → `401`
* Unknown email → `401`
* Validation failures → `400`
* Case-insensitive email login
* Response never includes password/hash

---

# 12. Implementation Plan

1. Spec file
2. Schema + service + controller + route
3. Tests
4. Postman + README
5. Lint + test verification

---

# 13. Definition of Done

* [x] Requirement implemented
* [x] Existing architecture followed
* [x] Validation implemented
* [x] Public endpoint; JWT issued on success
* [x] Generic 401 for bad credentials
* [x] Error handling follows project conventions
* [x] No database changes required
* [x] Tests added
* [x] Tests pass
* [x] TypeScript compilation passes
* [x] No unrelated changes
* [x] Postman collection added
* [x] Implementation reviewed against this specification

---

## Approved Decisions

| Decision | Choice |
|----------|--------|
| Success status | `200` + same body as register |
| Credential errors | Same `401` message for bad email and bad password |
| Dummy hash when user missing | Yes |
| Password validation | min 8 / max 72 |
| Postman location | `backend/postman/` |
| Spec file | `specs/user-login.md` |
