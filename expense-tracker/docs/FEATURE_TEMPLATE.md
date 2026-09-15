# Feature: <Feature Name>

## 1. Requirement

### Problem

What problem are we solving?

### Goal

What should the system do after this feature is implemented?

### User Story

As a `<user>`, I want `<capability>` so that `<benefit>`.

---

# 2. Scope

## In Scope

*

## Out of Scope

*

---

# 3. Existing Code Analysis

## Related Features

*

## Existing Patterns

*

## Reusable Components

*

---

# 4. API Design

## Endpoint

### Method

`POST /api/v1/...`

### Authentication

Required / Not Required

### Authorization

Who can perform this operation?

### Request

```json
{}
```

### Success Response

```json
{}
```

### Error Cases

| Scenario      | Status | Error Code       |
| ------------- | -----: | ---------------- |
| Invalid input |    400 | VALIDATION_ERROR |
| Unauthorized  |    401 | UNAUTHORIZED     |
| Forbidden     |    403 | FORBIDDEN        |
| Not found     |    404 | NOT_FOUND        |
| Conflict      |    409 | CONFLICT         |

---

# 5. Database Changes

## Models Affected

*

## Schema Changes

*

## Relationships

*

## Constraints

*

## Indexes

*

## Migration

*

---

# 6. Business Logic

Describe the expected flow:

```text
Request
 ↓
Authentication
 ↓
Validation
 ↓
Controller
 ↓
Service
 ↓
Repository
 ↓
Database
 ↓
Response
```

Explain important business rules here.

---

# 7. Authorization & Ownership

Define:

* Who owns the resource?
* Who can read it?
* Who can create it?
* Who can update it?
* Who can delete it?

Explain how ownership is enforced.

---

# 8. Validation

## Body

*

## Query Parameters

*

## Route Parameters

*

---

# 9. Error Handling

Document expected failures:

*

Use the project's existing error taxonomy.

---

# 10. Files

## New Files

| File | Responsibility |
| ---- | -------------- |
|      |                |

## Modified Files

| File | Reason |
| ---- | ------ |
|      |        |

---

# 11. Testing Strategy

## Unit Tests

*

## Integration/API Tests

*

## Edge Cases

*

## Security Cases

*

---

# 12. Implementation Plan

1.
2.
3.
4.

---

# 13. Definition of Done

* [ ] Requirement implemented
* [ ] Existing architecture followed
* [ ] Validation implemented
* [ ] Authentication handled
* [ ] Authorization handled
* [ ] Ownership enforced
* [ ] Error handling follows project conventions
* [ ] Database changes completed
* [ ] Tests added
* [ ] Tests pass
* [ ] TypeScript compilation passes
* [ ] No unrelated changes
* [ ] Security review completed
* [ ] Implementation reviewed against this specification
