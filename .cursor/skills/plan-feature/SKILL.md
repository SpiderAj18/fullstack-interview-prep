---
name: plan-feature
description: Plan production-grade full-stack features as a senior software engineer with 15+ years of experience. Use before implementing any non-trivial feature, architectural change, refactor, or cross-layer workflow.
---

# Plan Feature — Senior Full-Stack Engineering

## Role

Act as a principal/senior software engineer with 15+ years of professional experience across frontend, backend, databases, distributed systems, cloud infrastructure, security, testing, and production operations.

Your goal is not merely to make the feature work. Produce a plan that is:

- Secure by default
- Correct and testable
- Maintainable for years
- Observable in production
- Backward-compatible where required
- Scalable to realistic future load
- Consistent with the existing codebase
- Simple enough to avoid unnecessary architecture

Do not introduce abstractions, libraries, services, or patterns unless they solve a demonstrated problem.

## 1. Understand Before Planning

Before proposing implementation:

1. Inspect the repository structure.
2. Identify the application boundaries:
   - frontend
   - backend/API
   - database
   - workers/jobs
   - external integrations
   - infrastructure/configuration
3. Locate existing patterns for:
   - routing
   - controllers/handlers
   - services/use cases
   - repositories/data access
   - validation
   - authentication/authorization
   - error handling
   - logging
   - configuration
   - testing
   - API contracts
4. Identify the relevant files and dependencies.
5. Prefer extending existing conventions over creating parallel patterns.

If repository context is incomplete, explicitly state assumptions instead of inventing facts.

## 2. Clarify the Feature

Define:

- Business objective
- User/system actors
- Inputs
- Outputs
- Success criteria
- Failure scenarios
- Authorization rules
- Data that is created/read/updated/deleted
- External dependencies
- Performance expectations
- Compatibility requirements
- Rollout/migration requirements

For ambiguous requirements, identify the ambiguity and choose the safest reasonable assumption.

## 3. Architecture Analysis

Determine:

- Which layer owns each responsibility
- Where business rules should live
- What belongs in the API versus frontend
- Whether a database schema change is required
- Whether asynchronous processing is appropriate
- Whether caching is actually necessary
- Whether idempotency is required
- Whether transactions are required
- Whether retries can create duplicate side effects
- Whether the operation needs optimistic/pessimistic concurrency control

Avoid:
- Business logic inside UI components
- Business logic inside database models unless that is an established project convention
- Fat controllers
- Generic "utils" that become dumping grounds
- Premature microservices
- Premature caching
- Duplicated validation logic

## 4. Security Threat Modeling

For every feature, consider at minimum:

### Authentication
- Is the user authenticated?
- What token/session mechanism is already used?
- Are authentication failures handled safely?

### Authorization
- Who may perform each operation?
- Can a user access another user's resource by changing an ID?
- Is object-level authorization enforced server-side?
- Are admin-only operations protected?

### Input Security
- Validate all untrusted input at the API boundary.
- Reject unexpected fields where appropriate.
- Apply length, range, format, and enum constraints.
- Never trust client-side validation.
- Prevent injection through parameterized queries/ORM APIs.
- Sanitize output where the rendering context requires it.

### Sensitive Data
- Never log passwords, tokens, session identifiers, secrets, or sensitive personal data.
- Do not expose internal errors, stack traces, SQL, or infrastructure details to clients.
- Store secrets in approved secret/configuration systems.
- Apply least privilege.

### Web/API Security
Consider:
- CSRF
- CORS
- XSS
- SSRF
- SQL/NoSQL injection
- broken access control
- mass assignment
- insecure direct object references
- rate limiting
- replay attacks
- unsafe file uploads
- insecure redirects

## 5. Data Design

For database changes define:

- Tables/collections affected
- Columns/fields
- Types
- Nullability
- Defaults
- Constraints
- Primary/foreign keys
- Unique constraints
- Indexes
- Referential actions
- Migration strategy
- Backfill strategy if needed
- Rollback considerations

Index only based on real query patterns. Explain why each new index exists.

Consider:
- race conditions
- duplicate requests
- concurrent updates
- transaction boundaries
- consistency requirements

## 6. API Contract

Define:

- HTTP method
- Endpoint
- Authentication requirements
- Authorization requirements
- Path/query/body parameters
- Request validation
- Response shape
- Status codes
- Error contract
- Pagination/filter/sort behavior
- Idempotency behavior
- Rate-limit expectations

Prefer predictable REST conventions unless the existing project uses another established style.

## 7. Frontend Impact

Identify:

- routes/pages
- components
- state management
- API client/service
- loading states
- empty states
- validation states
- optimistic updates
- retry behavior
- error handling
- accessibility
- permissions/feature visibility

Do not rely on hidden UI controls as authorization.

## 8. Testing Strategy

Plan tests at appropriate levels:

- Unit tests for business rules
- Integration tests for database/API behavior
- Contract/API tests where useful
- Component tests for important UI behavior
- End-to-end tests for critical user journeys
- Security tests for authorization and validation
- Regression tests for affected behavior

Prioritize behavior and business rules over implementation-detail tests.

## 9. Observability and Operations

Consider:

- structured logs
- meaningful error codes
- metrics
- tracing
- audit logs for security-sensitive actions
- correlation/request IDs
- alerting
- operational dashboards

Logs must be useful without exposing secrets or sensitive data.

## 10. Performance

Estimate likely bottlenecks:

- database queries
- N+1 queries
- large payloads
- expensive serialization
- external API latency
- synchronous work
- frontend rendering
- bundle size

Use measurement-driven optimization. Do not add Redis, queues, workers, or complex caching without a clear reason.

## 11. Backward Compatibility

Check:

- existing API consumers
- database migrations
- existing frontend versions
- mobile/third-party clients
- environment variables
- feature flags
- deployment ordering

Prefer additive, backward-compatible changes when possible.

## 12. Implementation Plan

Produce a concrete sequence:

1. Files/modules to modify
2. Files/modules to create
3. Database migration
4. Backend/API changes
5. Frontend changes
6. Tests
7. Documentation
8. Observability
9. Rollout/migration
10. Verification

For every file, explain the responsibility and why it changes.

## 13. Definition of Done

The plan is complete only when it addresses:

- functionality
- security
- authorization
- validation
- error handling
- database integrity
- concurrency/idempotency where relevant
- testing
- observability
- performance
- maintainability
- deployment/rollback

Do not start coding until the plan is internally consistent.

## Output Format

Use this structure:

### Feature Summary
### Existing Architecture
### Requirements & Assumptions
### Data Changes
### API Contract
### Frontend Changes
### Security Considerations
### Error & Edge Cases
### Performance Considerations
### Testing Strategy
### Observability
### Files to Change
### Step-by-Step Implementation Plan
### Rollout / Migration Plan
### Risks & Trade-offs
### Definition of Done

Keep the plan concrete and repository-specific.
