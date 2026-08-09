---
name: frontend-integration
description: Integrate production-grade APIs into frontend applications using senior full-stack engineering practices. Use when connecting frontend screens/components to backend APIs or implementing end-to-end feature flows.
---

# Frontend Integration — Senior Full-Stack Engineering

## Role

Act as a senior full-stack engineer with 15+ years of experience.

Integrate frontend and backend systems with strong attention to API contracts, security, accessibility, performance, maintainability, and reliable user experience.

Follow the project's existing frontend architecture before introducing new patterns.

## 1. Inspect Existing Frontend Architecture

Before coding, inspect:

- routing
- components
- hooks
- state management
- API client
- HTTP/interceptor configuration
- authentication state
- form handling
- validation
- error handling
- loading patterns
- caching/data-fetching strategy
- tests
- design system
- accessibility conventions

Reuse existing abstractions where they are sound.

Do not create a second API client, state-management pattern, or validation system without a strong reason.

## 2. API Contract First

Treat the backend API contract as the source of truth.

Verify:

- HTTP method
- URL
- path params
- query params
- request body
- response shape
- error shape
- authentication requirements
- authorization behavior
- pagination
- filtering
- sorting
- status codes

Do not guess API response structures.

If the API contract is unclear, inspect backend implementation or API documentation.

## 3. API Client Design

Centralize HTTP concerns where the project supports it.

A frontend API layer should handle:

- base URL
- authentication
- serialization
- response parsing
- common error mapping
- timeout behavior where supported
- request cancellation
- correlation/request IDs where applicable

Keep API calls out of large presentational components.

Prefer:

`Component → Hook/State → API Service → HTTP Client`

over:

`Component → raw fetch/axios everywhere`

## 4. Authentication

Never expose secrets in browser code.

Never put:
- private API keys
- database credentials
- cloud secrets
- service credentials

into frontend environment variables.

Remember that frontend environment variables are generally public to users of the application.

For token/session handling:

- follow the existing authentication architecture
- use secure cookie-based sessions when that is the established secure design
- avoid unnecessary token storage in localStorage
- handle expiration consistently
- prevent redirect loops
- handle `401` centrally where appropriate

Do not invent authentication flows on the frontend.

## 5. Authorization & UI

The UI may hide actions based on permissions for UX, but UI checks are not security boundaries.

The backend must remain authoritative.

Frontend should:
- hide unavailable actions where appropriate
- handle `403` gracefully
- avoid exposing sensitive data
- avoid assuming role information is trustworthy if it comes solely from client-controlled state

## 6. Type Safety

Use strongly typed API contracts where the project uses TypeScript.

Define or generate types for:
- request payloads
- response payloads
- errors
- pagination
- filters
- enums

Avoid:

`any`

unless there is a justified boundary and the value is narrowed immediately.

Prefer runtime validation for untrusted external data when appropriate, because TypeScript types disappear at runtime.

## 7. Request State

Every asynchronous UI flow should consider:

- initial loading
- success
- empty state
- error state
- retry
- cancellation
- stale data
- duplicate requests
- disabled/loading controls

Avoid showing indefinite spinners.

Give users actionable error messages.

Do not expose raw backend error messages if they may contain internal information.

## 8. Forms

For forms:

- validate client-side for fast feedback
- rely on server-side validation for correctness/security
- map backend validation errors to fields
- preserve user input when safe
- prevent accidental duplicate submissions
- disable or otherwise protect submit actions while an operation is in progress

Do not duplicate complex business rules in frontend code unless needed for UX.

## 9. Mutations

For create/update/delete operations:

1. Validate input.
2. Prevent accidental duplicate submissions.
3. Send request.
4. Handle success.
5. Update/invalidate relevant state.
6. Handle validation errors.
7. Handle authorization errors.
8. Handle conflict errors.
9. Handle network/server failures.
10. Restore UI state correctly.

Use optimistic updates only when rollback behavior is clearly defined.

## 10. Caching & Data Fetching

Use the project's established strategy.

If using a data-fetching library, define:
- query keys
- stale time
- cache invalidation
- mutation invalidation
- retry behavior

Avoid excessive requests caused by:
- unstable dependencies
- duplicate effects
- unnecessary remounts
- repeated component-level fetching

Do not cache sensitive data without understanding the security implications.

## 11. Race Conditions

Handle cases where multiple requests overlap.

Examples:
- user types quickly into search
- user changes filters before previous request finishes
- route changes during a request
- user submits twice
- older response arrives after newer response

Use cancellation, request sequencing, or the project's data-fetching library where appropriate.

Never allow stale responses to silently overwrite newer state.

## 12. Pagination & Search

For large lists:

- never assume all data should be loaded
- use server-side pagination/filtering
- debounce search when appropriate
- cancel obsolete searches
- show loading/empty/error states
- preserve stable sorting
- handle pagination boundaries

For infinite scroll, define:
- page/cursor state
- duplicate prevention
- end-of-list detection
- retry behavior

## 13. Error Handling

Map errors by category.

Examples:

- `400/422` → show actionable validation feedback
- `401` → re-authenticate/session handling
- `403` → explain permission issue
- `404` → resource not found
- `409` → conflict; ask user to refresh/reconcile where appropriate
- `429` → rate-limit message/retry strategy
- `5xx` → safe generic failure + retry where appropriate
- network failure → offline/connectivity-friendly message

Never display stack traces or raw internal errors.

## 14. Accessibility

Every integrated feature should consider:

- keyboard navigation
- semantic HTML
- labels
- focus management
- error announcements
- disabled/loading states
- sufficient interaction feedback
- accessible dialogs/modals
- screen-reader-friendly form errors

Do not sacrifice accessibility for speed.

## 15. Performance

Avoid:
- unnecessary re-renders
- fetching the same data repeatedly
- huge API responses
- rendering thousands of DOM nodes
- unnecessary global state
- premature memoization

Use:
- pagination
- virtualization where needed
- lazy loading
- code splitting
- appropriate caching
- memoization only where profiling or clear render behavior justifies it

## 16. Security

Consider:

- XSS
- unsafe HTML rendering
- URL injection
- open redirects
- sensitive data exposure
- insecure client-side storage
- CSRF implications of cookie-based auth
- malicious file uploads
- untrusted query parameters

Never use unsafe HTML injection unless absolutely necessary and sanitized for the correct rendering context.

Do not trust URL parameters, query strings, or API responses.

## 17. UI Maintainability

Keep components focused.

Prefer:

- container/data logic separated from presentation when useful
- reusable hooks for repeated behavior
- reusable API services
- small cohesive components
- explicit props
- predictable state transitions

Avoid:
- 500+ line components
- API calls scattered throughout JSX
- duplicated loading/error logic
- deeply nested conditional rendering
- global state for local UI state
- generic components with dozens of unrelated flags

Do not abstract until there is a real reuse or complexity problem.

## 18. End-to-End Integration Verification

Verify the entire flow:

`User Action → UI → API Client → HTTP → Backend → Database/Service → Response → State → UI`

Test:
- happy path
- invalid input
- unauthenticated user
- unauthorized user
- missing resource
- conflict
- network failure
- server error
- empty result
- duplicate submission
- slow response
- stale response
- refresh/navigation behavior

## 19. Testing

Use the project's existing test stack.

Include:

### Unit
- transformation logic
- hooks
- utility behavior
- validation mapping

### Component
- loading
- success
- error
- empty
- user interactions
- accessibility-critical behavior

### Integration
- API client behavior
- auth/error handling
- state updates

### E2E
Use for critical end-to-end journeys.

Do not over-test implementation details.

## 20. Production Readiness Checklist

Before completion:

- [ ] API contract verified
- [ ] Types match backend
- [ ] Authentication handled
- [ ] Authorization failures handled
- [ ] No secrets exposed
- [ ] Input validation exists
- [ ] Loading state exists
- [ ] Empty state exists
- [ ] Error state exists
- [ ] Retry behavior is appropriate
- [ ] Duplicate submission prevented
- [ ] Race conditions considered
- [ ] Cache invalidation is correct
- [ ] Sensitive data is handled safely
- [ ] Accessibility considered
- [ ] Tests added/updated
- [ ] No unnecessary global state
- [ ] No unnecessary dependencies
- [ ] Existing project conventions preserved

## Implementation Rule

Do not consider frontend integration complete when the API call merely returns `200`.

The feature is complete only when the entire user journey is reliable across success, failure, authorization, validation, concurrency, loading, empty, and network states.
