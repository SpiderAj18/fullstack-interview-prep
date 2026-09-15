# Codebase Context

> Analyzed from the live `expense-tracker` tree as of this document. Conclusions are verified against actual source execution paths, not folder names alone. This application is an early backend scaffold: infrastructure and conventions are in place; most domain features are not yet implemented.

---

## Document Status

- Purpose: Describe the current implementation state of the repository.
- Source of truth: Actual source code takes precedence over this document.
- This document may become stale as the codebase evolves.
- Update this document when a significant architectural decision or structural change occurs.
- Do not treat planned/intended architecture as implemented architecture.

## 1. Executive Summary

**Expense Tracker** is a personal-expense API intended to let authenticated users manage expenses and categories. The repository currently contains **only a backend** (`expense-tracker/backend`). There is no frontend app, no workers, and no third-party SaaS integrations beyond JWT/local SQLite.

**What exists today**

- Express 5 + TypeScript HTTP API with security middleware (Helmet, CORS, JSON body limit).
- Request correlation IDs + structured request logging.
- Global error mapping (`AppError`, Zod, 404, 500).
- JWT Bearer auth helpers (`authenticate`, `requireAuth`, `signAccessToken`) — **not mounted on any route yet**.
- Prisma schema for `User`, `Category`, `Expense` with SQLite.
- One live feature route: `GET /api/v1/health`.

**What does not exist yet**

- Auth register/login routes and password hashing usage.
- Expense/Category CRUD, services, repositories.
- Migrations folder (schema is pushed via `prisma db push`).
- Tests, queues, scheduled jobs, email/SMS/payment/AWS integrations.
- Frontend (CORS default targets Vite at `http://localhost:5173`).

**Primary problem domain:** personal finance tracking (users → categories → expenses).

---

## 2. Technology Stack

| Layer | Choice | Evidence |
|-------|--------|----------|
| Runtime | Node.js + TypeScript (ES2022, CommonJS) | `package.json`, `tsconfig.json` |
| HTTP | Express 5 | `express` `^5.1.0`, `src/app.ts` |
| ORM | Prisma 6 + `@prisma/client` | `prisma/schema.prisma`, `src/config/database.ts` |
| DB (dev) | SQLite via `DATABASE_URL=file:./dev.db` | `.env.example`, `schema.prisma` `provider = "sqlite"` |
| Validation | Zod 4 | `src/config/env.ts`, `errorHandler` handles `ZodError` |
| Auth tokens | `jsonwebtoken` | `src/middleware/auth.ts` |
| Password hashing (dep only) | `bcryptjs` | listed in `package.json`; **unused in `src/`** |
| Security headers | `helmet` | `createApp()` in `src/app.ts` |
| CORS | `cors` | `createApp()` |
| Config | `dotenv` + Zod schema | `src/config/env.ts` |
| Dev runner | `tsx watch` | `npm run dev` |

---

## 3. Architecture

### Actual architecture (verified)

**Monolithic layered HTTP API**, with the **intended** layering:

```text
Route → Controller → Service → Repository → Prisma
```

Documented in `backend/README.md`. Verified against code:

| Layer | Status | Notes |
|-------|--------|-------|
| Route | **Established** | `src/routes/healthRoutes.ts` mounts controller methods |
| Controller | **Established** | Object export pattern: `healthController.getHealth` |
| Service | **Placeholder** | `src/services/` empty directory |
| Repository | **Placeholder** | `src/repositories/` empty directory |
| Prisma access | **Scaffold** | Singleton `prisma` in `src/config/database.ts`; only `$connect()` used at boot |

**Important:** Do not assume services/repositories are used yet. The only end-to-end business-ish path is:

`healthRoutes` → `healthController.getHealth` → JSON response (no DB, no service).

### Architecture style classification

- **Monolith** (single Express process) — established
- **Layered / Route → Controller → Service → Repository** — declared convention; only Route + Controller exercised
- **Not** MVC with views, not microservices, not event-driven

### Cross-cutting layers (implemented)

- Config: `src/config/env.ts`, `src/config/database.ts`
- Middleware: auth, request context, error handling
- Domain errors: `src/utils/errors.ts`

---

## 4. Request Lifecycle

Traced from `src/server.ts` → `createApp()` in `src/app.ts`.

```text
1. startServer()
   - createApp()
   - prisma.$connect()
   - app.listen(env.PORT)

2. Per request (order in createApp):
   helmet
   → cors({ origin: env.CORS_ORIGIN, credentials: true })
   → express.json({ limit: "1mb" })
   → requestIdMiddleware   // sets req.requestId from x-request-id or UUID
   → requestLogger         // logs JSON on res "finish"
   → route match
        GET /                    inline handler in app.ts
        /api/v1/health/*         healthRouter
   → notFoundHandler       // 404 ApiErrorBody
   → errorHandler          // AppError | ZodError | 500
```

### Authentication/authorization in the lifecycle

Auth middleware is **available** but **not applied** to any registered route. Intended pattern (from `authenticate` + `requireAuth`):

1. `authenticate` reads `Authorization: Bearer <token>`, verifies JWT with `env.JWT_SECRET`, sets `req.user: AuthPayload`.
2. `requireAuth` asserts `req.user` is present.
3. Controllers/services would read `req.user.userId` / `req.user.email`.

Until routes mount these middlewares, all current endpoints are public.

### Logging flow

- Startup: `console.info(JSON.stringify({ message, port, environment }))` in `server.ts`.
- Per request: `requestLogger` emits JSON with `requestId`, `method`, `path`, `statusCode`, `durationMs`.
- Unhandled errors: `console.error("[unhandled-error]", { requestId, err })` in `errorHandler`.
- No structured logger library (pino/winston) and no log levels beyond console.

### Async / background processing

**None.** No queues, workers, cron, or event bus. Process is request/response only.

---

## 5. Directory Structure

Root of the product:

```text
expense-tracker/
└── backend/          # sole application package
    ├── prisma/       # schema + SQLite file (dev.db); no migrations/
    ├── src/          # application source
    ├── .env.example  # documented env keys
    ├── package.json
    ├── tsconfig.json
    └── README.md
```

### `backend/src/` responsibilities

| Path | Responsibility | Business logic? |
|------|----------------|-----------------|
| `server.ts` | Process entry: connect DB, listen | No |
| `app.ts` | Express composition, global middleware, route mount | No (except root info handler) |
| `config/` | Env validation, Prisma client singleton | No |
| `routes/` | HTTP path registration only | **Should not** hold business logic |
| `controllers/` | Map HTTP ↔ service calls; status/body | Thin; **should not** own domain rules long-term |
| `services/` | Business rules (intended) | **Yes** — empty today |
| `repositories/` | Data access via Prisma (intended) | Persistence only — empty today |
| `middleware/` | Auth, request ID, logging, errors | Cross-cutting only |
| `utils/` | Shared helpers (`AppError` hierarchy) | No domain features |
| `types/` | Shared TS types (intended) | Empty today |

### Architectural boundaries

- **Do not** put business rules in `routes/` or `middleware/` beyond auth gates.
- **Do not** put Prisma queries in controllers once repositories exist (README convention).
- Keep feature modules by **layer folders + feature-named files** (e.g. `routes/expenseRoutes.ts`, `controllers/expenseController.ts`), not by vertical feature folders — that is the layout already started.

---

## 6. Feature/Module Structure

### Functional / business domains (from schema + README)

1. **Identity / Auth** — `User` model; JWT helpers; register/login listed as next steps.
2. **Categories** — user-owned named categories (`Category`), unique per `(userId, name)`.
3. **Expenses** — amount/date/description, optional category, owned by user (`Expense`).
4. **Platform / Ops** — health check (implemented).

### Module organization pattern

**Horizontal layers + feature-named files** (not Nest-style modules, not feature folders containing all layers).

**Only implemented feature module:** Health

- Route: `src/routes/healthRoutes.ts` → `healthRouter.get("/", healthController.getHealth)`
- Controller: `src/controllers/healthController.ts` → exported object `healthController`
- Mount: `app.use("/api/v1/health", healthRouter)` in `createApp`

### Versioning

API prefix **`/api/v1`** is the established convention for feature routes.

---

## 7. API Conventions

### Routes & naming

- Prefix: `/api/v1/<resource>`
- Router file: `*Routes.ts`, export `*Router`
- Controllers: `*Controller.ts`, export object of handlers
- Root `GET /` returns API metadata (name, version, docs pointer) — one-off in `app.ts`

### HTTP methods (observed / intended)

| Method | Observed usage |
|--------|----------------|
| GET | Health, root info |
| POST/PUT/PATCH/DELETE | Not implemented yet; README plans register/login + CRUD |

### Controllers

Established pattern — plain object of functions (not classes):

```typescript
// src/controllers/healthController.ts
export const healthController = {
  getHealth(_req: Request, res: Response): void {
    res.status(200).json({ status: "ok", service: "expense-tracker-api", timestamp: ... });
  },
};
```

### Response format

- Success: ad hoc JSON (health returns `{ status, service, timestamp }`). No shared envelope like `{ data }` yet.
- Errors: uniform envelope via `ApiErrorBody`:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {},
    "requestId": "..."
  }
}
```

Defined in `errorHandler.ts` (`ApiErrorBody`).

### Error codes & status mapping (from `utils/errors.ts` + handlers)

| Class / case | HTTP | `code` |
|--------------|------|--------|
| `ValidationError` | 400 | `VALIDATION_ERROR` |
| raw `ZodError` | 400 | `VALIDATION_ERROR` |
| `UnauthorizedError` | 401 | `UNAUTHORIZED` |
| `ForbiddenError` | 403 | `FORBIDDEN` |
| `NotFoundError` / `notFoundHandler` | 404 | `NOT_FOUND` |
| `ConflictError` | 409 | `CONFLICT` |
| unknown | 500 | `INTERNAL_SERVER_ERROR` |

### Authentication convention (intended)

- Header: `Authorization: Bearer <jwt>`
- Middleware: `authenticate` then optionally `requireAuth`
- Payload claims: `{ userId, email }` (`AuthPayload`)

### Pagination / filtering / sorting / query params

**Not implemented.** README lists “Expense CRUD with pagination and filters” as a next step. No established query-param convention in code yet.

### Request validation

- Env: Zod at boot (`envSchema` in `config/env.ts`) — established.
- Request bodies/params: Zod handling is ready in `errorHandler`, but **no route-level schemas exist yet**. Preferred future pattern: parse with Zod in controller/middleware and throw `ZodError` or `ValidationError`.

---

## 8. Authentication & Authorization

### Mechanism

- **JWT access tokens** signed with `JWT_SECRET`, expiry from `JWT_EXPIRES_IN` (default `7d`).
- Helpers: `signAccessToken`, `authenticate` in `src/middleware/auth.ts`.
- Gate: `requireAuth` in `src/middleware/requireAuth.ts`.

### Request → identity flow (intended)

```text
Authorization: Bearer <token>
  → authenticate()
      → jwt.verify(token, env.JWT_SECRET)
      → req.user = { userId, email }
  → requireAuth()
      → if (!req.user) → UnauthorizedError
  → controller/service uses req.user.userId
```

### Authorization / roles / permissions

- No role model in Prisma schema.
- `ForbiddenError` exists for permission denials.
- Expected ownership model from schema: resources are scoped by `userId` (multi-tenant by user, not RBAC).

### Security-sensitive areas

| Area | Status |
|------|--------|
| Password hashing | `bcryptjs` dependency present; **no hashing code yet** |
| JWT secret | Required min length 16 via Zod; must not use example value in prod |
| Token on routes | Auth middleware **not wired** to any route |
| User extraction | Via `req.user` after `authenticate` |
| Cascade deletes | Prisma `onDelete: Cascade` for user→expenses/categories |

### Inconsistency / gap

Auth scaffolding is ahead of product routes: middleware and schema exist; register/login and protected CRUD do not.

---

## 9. Business Logic

**No domain business logic is implemented in services.**

Current logic locations:

| Concern | Location |
|---------|----------|
| Health payload | `healthController.getHealth` |
| JWT verify/sign | `middleware/auth.ts` |
| Env validation | `config/env.ts` |
| Error taxonomy | `utils/errors.ts` |

**Preferred home for future domain rules:** `src/services/*` (per README), calling `src/repositories/*` for Prisma.

Ownership rules implied by schema (not coded yet):

- Categories belong to a user; name unique per user.
- Expenses belong to a user; optional category; category nullified on category delete (`onDelete: SetNull`).

---

## 10. Database Architecture

### Technology

- **SQLite** for local development (`provider = "sqlite"`).
- Access via **Prisma Client** singleton: `export const prisma = new PrismaClient()` in `src/config/database.ts`.
- Boot: `await prisma.$connect()` in `startServer()`.

### Schema organization

Single file: `prisma/schema.prisma`.

### Models & relationships

```text
User 1 ── * Category
User 1 ── * Expense
Category 1 ── * Expense (optional on Expense; SetNull on category delete)
```

| Model | Keys / indexes | Notes |
|-------|----------------|-------|
| `User` | `id` cuid, `email` unique | `passwordHash`, optional `name` |
| `Category` | `@@unique([userId, name])`, `@@index([userId])` | optional `color` |
| `Expense` | `@@index([userId, date])`, `@@index([userId, categoryId])` | `amount` `Decimal`, required `date` |

### Migrations vs push

- Scripts: `db:migrate` (`prisma migrate dev`), `db:push`, `db:generate`, `db:studio`.
- **No `prisma/migrations/` directory** present; `dev.db` exists from push/generate usage.
- **Established practice for now:** schema-first in `schema.prisma` + push for local; migrate script is ready but unused.

### Transactions / repository patterns

- No `$transaction` usage in `src/`.
- No repository implementations — **intended pattern**, not yet established by code examples.

### Query patterns

Only connection at startup. No CRUD queries to copy yet.

### Best practices observed

- Cascade ownership deletes.
- Compound indexes aligned with likely list-by-user+date / user+category filters.
- Unique category names per user.

### Inconsistencies / gaps

- README promises repository layer; empty.
- SQLite + Decimal is fine for scaffold; production DB choice not configured.
- Migrations not versioned in repo yet.

---

## 11. Error Handling

### How errors are created

Throw or `next(err)` with subclasses of `AppError` from `src/utils/errors.ts`:

- `ValidationError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`
- Or let Zod throw / return `ZodError`

### Propagation

Express error middleware: `errorHandler(err, req, res, _next)` registered last in `createApp`.

Auth middleware already uses `next(new UnauthorizedError(...))` — preferred for middleware.

### Global handlers

1. `notFoundHandler` — unmatched routes → 404 `NOT_FOUND`
2. `errorHandler` — maps `AppError` / `ZodError` / fallback 500

### Logging

Unhandled (non-AppError, non-Zod) errors are logged with `requestId`. `AppError` responses are not specially logged.

### Preferred pattern for new features

1. Validate input (Zod); allow `ZodError` to reach `errorHandler`, or throw `ValidationError`.
2. In services, throw `NotFoundError` / `ConflictError` / `ForbiddenError` for domain failures.
3. Do not manually `res.status(...).json({ error })` in controllers for those cases — let the global handler format `ApiErrorBody`.
4. Controllers catch only if they must transform; default is rethrow/`next`.

---

## 12. Validation

| Scope | Library | Where | Status |
|-------|---------|-------|--------|
| Environment | Zod (`envSchema.safeParse`) | `config/env.ts` at import time | **Established** — fails process on invalid env |
| HTTP requests | Zod (intended) | Not present on routes | Handler ready for `ZodError` |
| Custom validation errors | `ValidationError` | `utils/errors.ts` | Available, unused |

**Preferred new-feature approach:** define Zod schemas near the feature (e.g. with controller or `validators/`), parse request body/query/params, rely on global `ZodError` → 400 `VALIDATION_ERROR` with `details: err.flatten()`.

No per-module validation divergence exists yet (only one feature).

---

## 13. External Integrations

| Integration | Present? | Abstraction |
|-------------|----------|-------------|
| AWS / cloud storage | No | — |
| Payments | No | — |
| Email / SMS | No | — |
| Queues | No | — |
| Auth providers (OAuth, etc.) | No | Local JWT only |
| Third-party HTTP APIs | No | — |

**Local “integrations” only:**

- SQLite file via Prisma
- JWT crypto via `jsonwebtoken`
- Planned password hashing via `bcryptjs` (dependency reserved)

CORS is configured for a future Vite frontend origin — not an external SaaS.

---

## 14. Background Jobs / Queues

**None.** No workers, Bull/BullMQ, cron, or outbox pattern. All work is synchronous within the HTTP request (or would be, once features exist).

---

## 15. Testing Strategy

| Aspect | Finding |
|--------|---------|
| Test framework | **None** configured (`package.json` has no test script / jest / vitest / mocha) |
| Unit / integration / API tests | **Zero** test files |
| Fixtures / factories | None |
| Mocking strategy | None |
| Coverage | None |

README “Next Steps” explicitly lists integration tests.

**Recommendation aligned with project maturity (not yet a convention):**

- Prefer API/integration tests against `createApp()` with a test DB (`NODE_ENV=test`) once auth/CRUD exist.
- Unit-test services with mocked repositories when business rules grow.
- Until a runner is chosen, do not invent a parallel test layout; introduce one framework when the first feature lands.

---

## 16. Configuration

### Environment variables (from `.env.example` + `envSchema`)

| Variable | Role | Notes |
|----------|------|-------|
| `NODE_ENV` | `development` \| `test` \| `production` | default `development` |
| `PORT` | Listen port | default `3001` |
| `DATABASE_URL` | Prisma connection string | required |
| `JWT_SECRET` | JWT signing key | min length 16 |
| `JWT_EXPIRES_IN` | Token lifetime | default `7d` |
| `CORS_ORIGIN` | Allowed browser origin | default `http://localhost:5173` |

Loaded via `dotenv.config()` then Zod-parsed; invalid config **exits process**.

### Secrets handling

- `.env` gitignored; `.env.example` committed with placeholders.
- Do not commit real secrets; do not log `JWT_SECRET` or connection strings.

### Environments

- Schema allows `test` / `production`, but no separate config files or feature flags exist.
- Dev workflow: `npm run dev` (tsx watch), `db:push`, port 3001.

### Feature flags

**None.**

---

## 17. Coding Conventions

| Convention | Pattern | Evidence |
|------------|---------|----------|
| Language | TypeScript strict | `tsconfig.json` strict + unused checks |
| Modules | CommonJS emit | `"module": "CommonJS"` |
| Exports | Named functions / const objects | `createApp`, `healthController`, `healthRouter` |
| Async | `async`/`await` at bootstrap | `startServer` |
| Express 5 | Standard middleware signatures | `(req, res, next)` |
| Request augmentation | `declare global` Express `Request` | `requestId`, `user?` |
| Logging | JSON `console.info` / `console.error` | request + startup |
| Lint | `tsc --noEmit` as `npm run lint` | no ESLint/Prettier config in package |

### Separation of concerns

Intended and partially enforced by folders; services/repositories unused so controllers currently hold the only feature response shaping.

### Dependency management

- Runtime deps are lean and purposeful.
- `bcryptjs` is unused — reserved for upcoming auth.

---

## 18. Security Considerations

**In place**

- Helmet
- CORS allowlist (single origin)
- JSON body size limit `1mb`
- JWT secret minimum length enforced
- Password stored as hash field name (`passwordHash`) — schema anticipates hashing
- Cascade deletes prevent orphaned user data

**Gaps / risks (document only)**

- Example/default `JWT_SECRET` must be replaced before any real deployment.
- Auth middleware not applied — once private data exists, every protected route must mount `authenticate` (+ ownership checks).
- No rate limiting, refresh-token rotation, or password policy code.
- SQLite file on disk for dev — not a production multi-user deployment posture.
- No HTTPS termination in-app (expected at reverse proxy).
- Unhandled errors return generic 500 (good); ensure no stack traces leak (current handler does not send stacks).

---

## 19. Performance Considerations

- Indexes on `Expense(userId, date)` and `Expense(userId, categoryId)` anticipate list/filter queries.
- Single PrismaClient instance avoids connection thrash.
- No caching layer, pagination, or N+1 query patterns yet (no list endpoints).
- Request logging on every response is synchronous `console` — fine for scaffold scale.
- Body limit 1mb reduces abuse surface for large payloads.

---

## 20. Existing Technical Debt

1. **Layering aspirational vs actual** — README documents service/repository layers; directories are empty; only controller path exists.
2. **Auth half-built** — JWT helpers + `User.passwordHash` + `bcryptjs` unused; no register/login.
3. **No migrations** — relying on `db:push` / local `dev.db`; weaker for team/prod history.
4. **No tests** despite production-oriented positioning.
5. **Inconsistent error paths for 404** — `notFoundHandler` uses code `NOT_FOUND` directly; domain `NotFoundError` class unused so far (compatible shapes, dual entry points).
6. **`requireAuth` vs `authenticate`** — `requireAuth` alone cannot populate `req.user`; pairing is required but undocumented in code comments.
7. **Success response shape not standardized** — only error envelope is consistent.
8. **Empty `types/`** — Express types live via global augmentation in middleware files instead.
9. **No frontend** while CORS points at Vite — integration unfinished by design (next steps).
10. **Unused dependency** — `bcryptjs` until auth is implemented.

---

## 21. Recommended Pattern for New Features

Follow the README and health-route precedent, filling the empty layers:

```text
1. Prisma model change in schema.prisma → migrate/push
2. repository/<feature>Repository.ts   // Prisma queries only
3. service/<feature>Service.ts         // business rules; throw AppError subclasses
4. controller/<feature>Controller.ts   // parse/validate (Zod), call service, res.json
5. routes/<feature>Routes.ts           // wire HTTP + authenticate/requireAuth as needed
6. Mount under /api/v1/<resource> in app.ts
```

**Example mount style (established):**

```typescript
app.use("/api/v1/health", healthRouter);
```

**Auth-protected route style (inferred, not yet live):**

```typescript
featureRouter.get("/", authenticate, requireAuth, featureController.list);
```

---

## 22. Important Files / Entry Points

| File | Role |
|------|------|
| `backend/src/server.ts` | Process entry (`startServer`) |
| `backend/src/app.ts` | `createApp` — middleware + route registration |
| `backend/src/config/env.ts` | Typed `env` export |
| `backend/src/config/database.ts` | `prisma` singleton |
| `backend/prisma/schema.prisma` | Canonical data model |
| `backend/src/routes/healthRoutes.ts` | Example route module |
| `backend/src/controllers/healthController.ts` | Example controller |
| `backend/src/middleware/auth.ts` | `authenticate`, `signAccessToken`, `AuthPayload` |
| `backend/src/middleware/requireAuth.ts` | `requireAuth` |
| `backend/src/middleware/errorHandler.ts` | `errorHandler`, `notFoundHandler`, `ApiErrorBody` |
| `backend/src/middleware/requestContext.ts` | `requestIdMiddleware`, `requestLogger` |
| `backend/src/utils/errors.ts` | `AppError` hierarchy |
| `backend/README.md` | Intended architecture & roadmap |
| `backend/.env.example` | Config contract |

---

## 23. Architectural Decisions Observed

1. **Layered monolith over microservices** — single Express app; simplicity first (`createApp` + one process).
2. **API version prefix `/api/v1`** — room to evolve without breaking clients.
3. **Uniform error envelope** — clients can rely on `error.code` / `requestId` (`ApiErrorBody`).
4. **JWT Bearer, not sessions/cookies** — `authenticate` header parsing; CORS `credentials: true` still enabled for future cookie use or credentialed fetch.
5. **Schema-first multi-tenant-by-user** — all domain rows carry `userId`; no global shared categories.
6. **Zod for config (and planned requests)** — fail-fast env validation at boot.
7. **Placeholder directories for services/repositories/types** — architecture reserved before features.
8. **SQLite for local velocity** — Prisma keeps a path to other providers later via datasource URL/provider change.
9. **Controller-as-object** — not class-based DI; keep new controllers consistent with `healthController`.
10. **Observability lite** — request IDs + JSON console logs instead of full APM stack.

---

## New Feature Development Rules

1. **Do not invent a new architecture.** Use Route → Controller → Service → Repository → Prisma as documented and partially established.
2. **Mount features under `/api/v1/<resource>`** and register routers only in `createApp`.
3. **Keep routes thin** — wire middleware + controller methods only.
4. **Put business rules in services**; put Prisma access in repositories (do not skip straight from controller to Prisma once a feature has non-trivial logic).
5. **Use `AppError` subclasses** (`ValidationError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`) for domain/HTTP failures; let `errorHandler` format responses.
6. **Validate inputs with Zod**; prefer letting `ZodError` surface through `errorHandler`.
7. **Protect private routes** with `authenticate` then `requireAuth`; scope all queries by `req.user.userId`.
8. **Sign tokens only via `signAccessToken`**; payload shape `{ userId, email }`.
9. **Hash passwords with bcrypt** (dependency already present) before writing `User.passwordHash` — never store plaintext.
10. **Extend `schema.prisma` deliberately** — add indexes for new access patterns; use migrations (`db:migrate`) for shared environments when possible instead of only `db:push`.
11. **Preserve the error JSON shape** (`error.code`, `error.message`, optional `details`, `requestId`).
12. **Match existing naming:** `*Routes.ts`, `*Controller.ts`, object-export controllers, named function middleware.
13. **Do not add queues, microservices, or new frameworks** unless a concrete requirement forces them — none exist in this codebase.
14. **Add tests with the first non-trivial feature** (at least API-level against `createApp`); do not leave new domain logic untested once a test runner is introduced.
15. **Never commit secrets**; use `.env.example` keys only when documenting config.
16. **Read this document and `backend/README.md` before diverging** — prefer extending established conventions over one-off patterns.
`)
