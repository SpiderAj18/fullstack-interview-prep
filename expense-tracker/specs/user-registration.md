# Feature: User Registration

## 1. Requirement

### Problem

There is no way to create an account. Auth middleware, JWT helpers, and the `User` model exist, but register/login routes and password hashing are not implemented.

### Goal

Allow a new user to register with email, password, and optional name; persist a securely hashed password; return a usable auth response so they can access the API.

### User Story

As a **new user**, I want to **create an account with email and password** so that **I can authenticate and later manage my private expenses**.

---

# 2. Scope

## In Scope

* `POST /api/v1/auth/register`
* Zod request validation (email, password, optional name)
* Password hashing with `bcryptjs` → store only `passwordHash`
* Persist `User` via repository → Prisma
* Duplicate email → `409 CONFLICT`
* Issue JWT via existing `signAccessToken`
* Success response **without** password/hash
* Layered flow: Route → Controller → Service → Repository
* API tests with Vitest + Supertest

## Out of Scope

* Login (`POST /api/v1/auth/login`)
* Email verification, password reset, refresh tokens
* OAuth / social login
* Rate limiting
* Frontend
* Schema changes to `User`
* Roles/permissions beyond “anyone may register”

---

# 3. Existing Code Analysis

## Related Features

* Health — route/controller/mount style template
* Auth scaffolding — JWT sign/verify ready; unused on routes
* User model — `email` unique, `passwordHash`, optional `name`

## Existing Patterns

| Concern | Pattern | Source |
|--------|---------|--------|
| Layering | Route → Controller → Service → Repository | README, architecture rules |
| Routes | `Router` + controller method | `healthRoutes.ts` |
| Controllers | Object export | `healthController.ts` |
| Mount | `app.use("/api/v1/<resource>", router)` | `app.ts` |
| Auth token | `signAccessToken({ userId, email })` | `middleware/auth.ts` |
| Errors | `AppError` subclasses + global `errorHandler` | `utils/errors.ts` |
| Validation | Zod; `ZodError` → 400 | `env.ts`, `errorHandler.ts` |
| DB | Singleton `prisma` | `config/database.ts` |

## Reusable Components

* `signAccessToken`, `AuthPayload` — `src/middleware/auth.ts`
* `ConflictError` — `src/utils/errors.ts`
* `prisma` — `src/config/database.ts`
* `bcryptjs` — already in dependencies
* `errorHandler` — formats domain/Zod errors

---

# 4. API Design

## Endpoint

### Method

`POST /api/v1/auth/register`

### Authentication

Not required (public)

### Authorization

Any unauthenticated client may register.

### Request

```json
{
  "email": "jane@example.com",
  "password": "correct-horse-battery",
  "name": "Jane"
}
```

### Success Response

`201 Created`

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
| -------- | -----: | ---------- |
| Invalid / missing body fields | 400 | VALIDATION_ERROR |
| Email already registered | 409 | CONFLICT |
| Unhandled failure | 500 | INTERNAL_SERVER_ERROR |

---

# 5. Database Changes

## Models Affected

* `User` (create only)

## Schema Changes

None. Existing `User` model is sufficient.

## Constraints

* `email` unique — Prisma `P2002` mapped to `ConflictError`

## Indexes

None added (unique on `email` already exists).

## Migration

None required.

---

# 6. Business Logic

```text
POST /api/v1/auth/register
  ↓
(no auth middleware)
  ↓
Controller: Zod parse body
  ↓
Service: normalize email → hash password → create user
  ↓
Repository: prisma.user.create
  ↓
On unique violation → ConflictError
  ↓
Service: signAccessToken({ userId, email })
  ↓
Controller: 201 + { user, accessToken }
```

### Rules

1. Store only bcrypt hash in `passwordHash`.
2. Email uniqueness is authoritative (DB constraint).
3. Optional `name` may be omitted/null.
4. Response must omit secrets.
5. Service must not use Express `Request`/`Response`.

---

# 7. Authorization & Ownership

* Registration is public.
* The created `User` becomes the account identity for future owned resources (`userId`).

---

# 8. Validation

## Body

| Field | Rules |
|-------|--------|
| `email` | required, trim, email format, max 255, stored lowercased |
| `password` | required, min 8, max 72 |
| `name` | optional, trim, max 100; empty → null |

Unknown keys rejected (`z.object(...).strict()`).

## Query Parameters

None

## Route Parameters

None

---

# 9. Error Handling

| Failure | Mechanism |
|---------|-----------|
| Bad body | `ZodError` → global handler → 400 |
| Duplicate email | `ConflictError` → 409 |
| Unexpected | → 500; no SQL/stack leakage |

---

# 10. Files

## New Files

| File | Responsibility |
| ---- | -------------- |
| `backend/src/validators/authSchemas.ts` | Zod schemas for auth bodies |
| `backend/src/utils/password.ts` | bcrypt hash/compare |
| `backend/src/repositories/userRepository.ts` | User persistence |
| `backend/src/services/authService.ts` | Register business logic |
| `backend/src/controllers/authController.ts` | HTTP adapter |
| `backend/src/routes/authRoutes.ts` | Route wiring |
| `backend/src/test/setup.ts` | Test env / DB setup |
| `backend/src/test/auth.register.test.ts` | Registration API tests |
| `specs/user-registration.md` | This specification |

## Modified Files

| File | Reason |
| ---- | ------ |
| `backend/src/app.ts` | Mount `/api/v1/auth` |
| `backend/package.json` | Test scripts + Vitest/Supertest |
| `backend/README.md` | Document register endpoint |

---

# 11. Testing Strategy

## Unit / Service

* Password hash is not plaintext and verifies with compare
* Duplicate email surfaces as conflict

## Integration/API Tests

* `201` happy path; `user` + `accessToken`; no `passwordHash`
* `400` invalid email / short password / missing fields
* `409` duplicate email
* Token claims include `userId` and `email`

## Security Cases

* Response never includes password/hash
* Stored value ≠ plaintext password

---

# 12. Implementation Plan

1. Add password util
2. Add Zod register schema
3. Add user repository
4. Add auth service
5. Add controller + routes
6. Mount in `app.ts`
7. Add Vitest + Supertest tests
8. Verify lint and tests

---

# 13. Definition of Done

* [x] Requirement implemented
* [x] Existing architecture followed
* [x] Validation implemented
* [x] Authentication handled (public register; JWT issued)
* [x] Authorization handled (public create)
* [x] Ownership enforced (N/A for create; identity established)
* [x] Error handling follows project conventions
* [x] Database changes completed (none required)
* [x] Tests added
* [x] Tests pass
* [x] TypeScript compilation passes
* [x] No unrelated changes
* [x] Security review completed
* [x] Implementation reviewed against this specification

---

## Approved Decisions

| Decision | Choice |
|----------|--------|
| Success body | `{ user, accessToken }` with `201` |
| Password policy | min 8 / max 72 |
| Tests | Vitest + Supertest |
| Validators | `src/validators/authSchemas.ts` |
| bcrypt rounds | 12 |
| Email normalize | trim + lowercase |
