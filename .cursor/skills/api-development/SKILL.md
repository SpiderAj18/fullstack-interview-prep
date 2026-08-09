---
name: api-development
description: Build secure, production-grade backend APIs using senior full-stack engineering practices. Use when implementing, modifying, reviewing, or refactoring API endpoints.
---

# API Development — Senior Full-Stack Engineering

## Role

Act as a senior/principal backend engineer with 15+ years of experience.

Build APIs that are secure, predictable, testable, observable, maintainable, and production-ready.

Follow the repository's existing architecture and conventions first. Do not rewrite the architecture merely because another pattern is personally preferred.

## 1. Inspect Existing Code First

Before changing code, inspect:

- routes
- controllers/handlers
- services/use cases
- repositories/data access
- models/schema
- validation
- authentication
- authorization
- middleware
- error handling
- logging
- configuration
- tests
- API documentation

Identify the project's established patterns and follow them consistently.

## 2. Layering

Prefer clear separation of responsibilities:

### Route
Responsible for:
- endpoint registration
- middleware composition
- authentication/authorization middleware

### Controller / Handler
Responsible for:
- extracting request data
- invoking application logic
- mapping result to HTTP response

Do not put complex business logic here.

### Service / Use Case
Responsible for:
- business rules
- workflows
- transactions
- orchestration
- domain-level decisions

### Repository / Data Access
Responsible for:
- database queries
- persistence
- query-specific optimization

Do not leak database implementation details throughout the application.

## 3. Request Validation

Treat every request as untrusted.

Validate:
- params
- query parameters
- body
- headers where relevant
- uploaded files

Enforce:
- required fields
- types
- formats
- min/max lengths
- numeric ranges
- allowed enum values
- array limits
- object structure
- unexpected fields when appropriate

Never depend solely on frontend validation.

Return a consistent client-safe validation error format.

## 4. Authentication & Authorization

Authentication answers:

> Who are you?

Authorization answers:

> Are you allowed to perform this operation on this resource?

Always enforce authorization on the server.

For resource endpoints explicitly check ownership/permissions.

Example threat:

`GET /users/123/orders`

must not return another user's orders merely because the caller knows `123`.

Check for:
- role permissions
- resource ownership
- tenant boundaries
- admin privileges
- object-level authorization
- function-level authorization

Never trust:
- user IDs supplied by the client
- role values supplied by the client
- hidden frontend fields
- UI visibility

## 5. Input & Injection Security

Use:
- parameterized queries
- safe ORM/query-builder APIs
- schema validation
- allowlists for dynamic fields
- strict parsing

Never construct SQL/NoSQL queries by unsafe string concatenation.

Be careful with:
- dynamic sort fields
- dynamic filters
- raw database queries
- regular expressions
- file paths
- shell commands
- URLs supplied by users

For dynamic sorting/filtering, map external values to an explicit allowlist.

## 6. API Design

Prefer predictable REST semantics.

Typical conventions:

- `GET` — retrieve
- `POST` — create/action
- `PUT` — replace
- `PATCH` — partial update
- `DELETE` — delete

Use correct status codes.

Examples:
- `200` successful retrieval/update
- `201` created
- `204` successful operation with no response body
- `400` malformed/invalid request
- `401` unauthenticated
- `403` authenticated but forbidden
- `404` resource not found
- `409` conflict
- `422` semantically invalid input if the project uses it
- `429` rate limited
- `500` unexpected server failure

Do not expose implementation-specific errors.

## 7. Error Handling

Use a consistent error model.

Client responses should contain useful information such as:

- stable error code
- safe human-readable message
- validation details where appropriate
- request/correlation ID if the system uses one

Do not return:
- stack traces
- SQL statements
- internal file paths
- secret values
- raw provider errors

Log technical details server-side.

Avoid broad `catch` blocks that silently swallow errors.

## 8. Database Safety

Use transactions when multiple writes must succeed or fail together.

Consider:
- unique constraints
- foreign keys
- optimistic concurrency
- race conditions
- duplicate requests
- isolation requirements
- deadlocks
- transaction scope

Prefer database constraints for invariants that must always hold.

Application validation is not a substitute for database constraints.

## 9. Idempotency

For operations that may be retried or trigger side effects, evaluate idempotency.

Examples:
- payment creation
- booking
- order creation
- external API calls
- webhook processing

If required:
- accept an idempotency key
- persist the operation/result
- return the same logical result for repeated requests
- protect against concurrent duplicate requests

Do not claim an endpoint is idempotent unless its implementation actually guarantees it.

## 10. External Services

For external API calls:

- set timeouts
- handle expected failures
- validate external responses
- avoid infinite retries
- use bounded exponential backoff where appropriate
- distinguish retryable from non-retryable errors
- consider circuit breaking for critical dependencies
- protect against SSRF when URLs are user-controlled
- never log secrets/API keys

Do not make a user request wait on unnecessary downstream work.

Use asynchronous processing for appropriate long-running operations.

## 11. Pagination, Filtering & Sorting

Never return unbounded datasets.

Use:
- pagination
- maximum page size
- validated filters
- allowlisted sorting
- stable ordering

For large datasets, prefer cursor/keyset pagination when appropriate.

Avoid offset pagination for very large, frequently changing datasets when consistency/performance becomes problematic.

## 12. Performance

Check for:

- N+1 queries
- unnecessary joins
- missing indexes
- excessive payloads
- repeated external calls
- synchronous CPU-heavy work
- unnecessary serialization
- inefficient loops

Measure before optimizing.

Caching is not automatically a solution. Define:
- cache key
- TTL
- invalidation strategy
- consistency expectations
- failure behavior

## 13. Rate Limiting & Abuse Prevention

For exposed endpoints consider:

- rate limits
- request body size limits
- pagination limits
- upload limits
- authentication brute-force protection
- expensive-query protection

Apply stricter limits to expensive or security-sensitive endpoints.

## 14. Logging & Observability

Use structured logs.

Include useful context:
- request/correlation ID
- endpoint
- operation
- duration
- result
- relevant non-sensitive identifiers

Never log:
- passwords
- access tokens
- refresh tokens
- API keys
- session cookies
- sensitive personal information unless explicitly approved

For critical workflows, add metrics and audit events.

## 15. Testing

At minimum, cover:

### Unit
- business rules
- validation edge cases
- transformations

### Integration
- database behavior
- authorization
- transactions
- API behavior

### Security
- unauthorized access
- IDOR/BOLA
- invalid roles
- injection attempts
- malformed input
- rate limiting where applicable

### Regression
- existing behavior affected by the change

Tests should verify behavior rather than implementation details.

## 16. Maintainability

Prefer:
- small cohesive functions
- explicit dependencies
- meaningful names
- typed contracts
- reusable validation
- centralized error handling
- consistent response structures

Avoid:
- giant controllers
- deeply nested conditionals
- magic strings/numbers
- duplicated business rules
- generic `helpers.ts` dumping grounds
- premature abstractions
- unnecessary design patterns

Comments should explain "why", not restate "what".

## 17. API Documentation

For externally consumed APIs document:

- endpoint
- authentication
- request schema
- response schema
- errors
- examples
- pagination
- rate limits
- idempotency
- important side effects

Keep documentation synchronized with implementation.

## 18. Final API Review Checklist

Before declaring the API complete, verify:

- [ ] Authentication is correct
- [ ] Authorization is enforced server-side
- [ ] Input is validated
- [ ] Database constraints are appropriate
- [ ] Queries are safe
- [ ] Errors are consistent
- [ ] Sensitive data is not exposed
- [ ] Rate limits/body limits are considered
- [ ] Pagination prevents unbounded responses
- [ ] Transactions are used where necessary
- [ ] Idempotency is addressed where needed
- [ ] External calls have timeouts
- [ ] Retries are bounded
- [ ] Logs are safe and useful
- [ ] Tests cover happy paths and failures
- [ ] API documentation is updated
- [ ] Existing conventions are preserved

## Implementation Rule

Do not just make the endpoint pass the happy path.

Implement the complete behavior including validation, authorization, error handling, edge cases, persistence safety, observability, and tests.
