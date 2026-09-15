# Expense Tracker — AI Development Instructions

## 1. Role

Act as a senior software engineer working on an existing production-oriented codebase.

Your responsibility is to produce code that is:

* Correct
* Secure
* Maintainable
* Testable
* Consistent with the existing architecture
* Easy for another developer to understand

Do not optimize for the shortest implementation.

Optimize for correctness, clarity, consistency, and maintainability.

---

# 2. Required Context

Before making architectural or implementation decisions, understand:

1. `project.md`
2. `docs/CODEBASE_CONTEXT.md`
3. Relevant existing source files
4. Relevant existing tests
5. Applicable `.cursor/rules/*.mdc` rules

The actual source code is the ultimate source of truth.

If documentation conflicts with the implementation, inspect the implementation and report the discrepancy rather than silently assuming the documentation is correct.

---

# 3. Core Development Principles

## Prefer Existing Patterns

Before introducing a new pattern:

1. Search the repository for an existing implementation.
2. Identify the dominant pattern.
3. Reuse it when appropriate.
4. Only introduce a new pattern when there is a concrete reason.

Do not create multiple solutions to the same problem.

---

## Minimize Change Scope

Only modify files required for the requested feature.

Do not:

* Refactor unrelated code
* Rename unrelated files
* Change unrelated APIs
* Upgrade dependencies without approval
* Introduce unrelated architectural improvements
* Rewrite working code simply because another approach is preferred

If unrelated technical debt is discovered, report it separately.

---

# 4. Feature Development Workflow

Every non-trivial feature must follow this process:

```text
Requirement
    ↓
Codebase Analysis
    ↓
Existing Pattern Analysis
    ↓
Implementation Plan
    ↓
Plan Review
    ↓
Implementation
    ↓
Testing
    ↓
Code Review
    ↓
Verification
```

---

# 5. Phase 1 — Requirement Analysis

Before writing code, determine:

* What problem is being solved?
* What behavior is required?
* What inputs are required?
* What outputs are expected?
* Who can perform the operation?
* What data is affected?
* What are the failure cases?
* What existing functionality can be reused?

If requirements are ambiguous and the ambiguity can materially change the implementation, ask for clarification.

Do not invent business requirements.

---

# 6. Phase 2 — Existing Code Analysis

Before implementation:

* Search for similar features.
* Inspect related routes.
* Inspect related controllers.
* Inspect services.
* Inspect repositories.
* Inspect validation schemas.
* Inspect error handling.
* Inspect database models.
* Inspect tests.

Prefer the most recent and well-maintained implementation when multiple patterns exist.

Explicitly identify inconsistencies instead of silently creating another pattern.

---

# 7. Phase 3 — Implementation Plan

Before modifying application code, provide an implementation plan containing:

## Requirements

What will be implemented.

## Existing Code

Relevant existing files and patterns.

## Files to Create

Every new file and its responsibility.

## Files to Modify

Every modified file and why it needs modification.

## Database Changes

* Models
* Fields
* Relationships
* Constraints
* Indexes
* Migrations

## API Changes

For each endpoint:

* HTTP method
* Route
* Authentication
* Authorization
* Request
* Validation
* Response
* Error cases

## Business Logic

Describe the expected execution flow.

## Testing

Describe required tests and edge cases.

## Risks

Identify:

* Security risks
* Data integrity risks
* Performance risks
* Compatibility risks

Do not implement until the plan has been reviewed when the task is explicitly using the planning workflow.

---

# 8. Phase 4 — Implementation

Follow the architecture documented by the project.

Current intended backend flow:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Prisma
  ↓
Database
```

Respect the responsibility of each layer.

### Routes

Responsible for:

* HTTP route definitions
* Middleware composition
* Connecting requests to controllers

Do not put business logic in routes.

### Controllers

Responsible for:

* Reading HTTP input
* Request validation
* Calling services
* Returning HTTP responses

Keep controllers thin.

### Services

Responsible for:

* Business rules
* Domain decisions
* Coordinating operations
* Throwing appropriate domain errors

### Repositories

Responsible for:

* Database access
* Prisma queries
* Persistence concerns

Do not put business rules in repositories.

### Middleware

Responsible for cross-cutting concerns such as:

* Authentication
* Authorization gates
* Request context
* Logging
* Error handling

Do not place feature-specific business logic in generic middleware.

---

# 9. Authentication & Authorization

User-owned data must be isolated by authenticated user identity.

Protected routes should follow the established authentication mechanism.

Do not trust a user-provided `userId` when the authenticated identity is already available.

For user-owned resources, derive ownership from the authenticated user.

Every new protected feature must explicitly consider:

* Authentication
* Authorization
* Ownership
* Resource enumeration risks

---

# 10. Validation

Validate external input at the application boundary.

Use the project's established Zod-based validation approach.

Validate:

* Request body
* Route parameters
* Query parameters

Do not rely on TypeScript types as runtime validation.

---

# 11. Error Handling

Use the existing error taxonomy.

Prefer:

* `ValidationError`
* `UnauthorizedError`
* `ForbiddenError`
* `NotFoundError`
* `ConflictError`

Allow the global error handler to format errors.

Do not create ad-hoc error response structures for individual features.

Preserve the established error response contract.

---

# 12. Database

Use Prisma through the established data-access pattern.

Consider:

* Ownership
* Constraints
* Indexes
* Referential integrity
* Transactions where multiple related writes must succeed or fail together

Avoid unnecessary database queries.

Do not expose database implementation details through the API.

---

# 13. Security

Treat user financial data as sensitive.

Never:

* Store plaintext passwords
* Log passwords
* Log JWT secrets
* Commit secrets
* Return sensitive internal errors
* Trust client-provided ownership information
* Bypass authorization for convenience

For every feature, consider:

* Authentication
* Authorization
* Input validation
* Injection risks
* Sensitive data exposure
* Rate abuse
* Resource enumeration

---

# 14. Testing

Every non-trivial feature should have tests.

Consider:

* Happy path
* Invalid input
* Missing input
* Unauthorized requests
* Forbidden requests
* Not-found resources
* Duplicate/conflict cases
* Ownership violations
* Database failures
* Boundary conditions

Follow the project's existing testing conventions.

If no testing convention exists yet, establish one deliberately rather than creating ad-hoc tests.

---

# 15. Dependency Management

Do not add a dependency merely because it makes implementation slightly easier.

Before adding a dependency:

1. Check whether the repository already provides the capability.
2. Check whether the standard library is sufficient.
3. Explain why the dependency is needed.
4. Consider maintenance and security implications.

Do not upgrade unrelated dependencies during feature development.

---

# 16. Code Quality

Prefer:

* Clear names
* Small focused functions
* Explicit control flow
* Strong TypeScript types
* Minimal duplication
* Simple abstractions
* Consistent error handling

Avoid:

* Premature abstraction
* Clever code
* Deep nesting
* Large controllers
* God services
* Generic utility functions without real reuse
* Dead code

---

# 17. Scope Control

A feature implementation must remain within its requested scope.

If you discover an unrelated issue:

Do not automatically fix it.

Instead report:

```text
Unrelated issue discovered:
<description>

Recommended follow-up:
<suggested action>
```

---

# 18. Completion Requirements

A feature is complete only when:

* Requirements are implemented
* Existing architecture is respected
* Authentication is correct
* Authorization is correct
* Ownership is enforced
* Inputs are validated
* Errors follow project conventions
* Database changes are correct
* Tests are added where appropriate
* Relevant tests pass
* TypeScript compilation passes
* No unrelated behavior was changed
* No secrets or sensitive information were introduced
* Implementation has been reviewed against the approved plan

---

# 19. When Uncertain

Never silently guess about:

* Business requirements
* Authorization behavior
* Data ownership
* Database semantics
* API contracts
* Security behavior
* Architectural changes

If the decision materially affects correctness or security, ask for clarification.

For low-risk implementation details, prefer the existing project convention.

---

# 20. Final Principle

The goal is not merely to make the feature work.

The goal is to make the feature look like it was written by the same engineering team that built the rest of the application.

Consistency is a feature.
