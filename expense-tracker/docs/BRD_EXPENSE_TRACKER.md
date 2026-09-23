# Expense Tracker --- Product & Feature Roadmap

**Document Type:** BRD + Feature Roadmap + AI-Native Development Plan\
**Status:** Living Document\
**Version:** 1.0\
**Purpose:** Single source of truth for AI-assisted/spec-driven
development of the Expense Tracker application.

------------------------------------------------------------------------

## 1. Product Vision

### Working Name

**Expense Tracker / Personal Financial Intelligence Platform**

### Vision

Build a production-grade personal finance platform that does more than
record expenses. The application should help users understand spending,
control budgets, identify unusual behavior, forecast future spending,
and eventually interact with their financial data using natural
language.

### Core Problem

Most basic expense trackers answer:

> "How much did I spend?"

This project should progressively answer:

1.  Where did my money go?
2.  What changed compared with previous months?
3.  Why did my spending increase?
4.  Am I going to exceed my budget?
5.  What recurring payments are coming?
6.  Which spending patterns are unusual?
7.  What happens if I change a spending habit?
8.  Can I ask questions about my finances in natural language?

### Product Principle

**Record → Understand → Detect → Predict → Act**

------------------------------------------------------------------------

# 2. Product Goals

## Primary Goals

-   Provide secure user authentication.
-   Track income, expenses, transfers, and financial accounts.
-   Support categories and merchant-level organization.
-   Provide budgeting and spending analytics.
-   Automate recurring transactions.
-   Detect unusual or duplicate transactions.
-   Forecast spending and budget utilization.
-   Generate actionable financial insights.
-   Provide natural-language querying of the user's own financial data.
-   Demonstrate production-grade backend engineering practices.

## Non-Goals for Initial Releases

Do not initially build:

-   Direct bank integrations.
-   Investment portfolio management.
-   Complex tax filing.
-   Lending/credit products.
-   Full accounting software.
-   AI chatbot before reliable financial data and query services exist.

------------------------------------------------------------------------

# 3. Target Users

## Primary User

An individual who wants to:

-   Record daily spending.
-   Track multiple bank accounts/cards/cash.
-   Set monthly budgets.
-   Understand spending trends.
-   Track subscriptions and recurring payments.
-   Set savings goals.
-   Receive useful warnings and insights.

## Future Users

-   Couples.
-   Families.
-   Small shared households.
-   Users importing bank statements.

------------------------------------------------------------------------

# 4. Product Modules

  ID       Module                           Priority   Phase
  -------- -------------------------------- ---------- ---------
  MOD-01   Authentication & Authorization   P0         MVP
  MOD-02   User Profile                     P0         MVP
  MOD-03   Categories                       P0         MVP
  MOD-04   Financial Accounts               P0         MVP
  MOD-05   Transactions                     P0         MVP
  MOD-06   Income & Transfers               P0         MVP
  MOD-07   Budgets                          P0         MVP
  MOD-08   Recurring Transactions           P1         Phase 2
  MOD-09   Subscriptions                    P1         Phase 2
  MOD-10   Notifications                    P1         Phase 2
  MOD-11   Analytics                        P1         Phase 3
  MOD-12   Receipt Management               P2         Phase 4
  MOD-13   Bank/CSV Import                  P2         Phase 4
  MOD-14   Financial Intelligence           P2         Phase 5
  MOD-15   AI Financial Assistant           P2         Phase 6
  MOD-16   Savings Goals                    P2         Phase 5
  MOD-17   Shared/Family Finance            P3         Future
  MOD-18   Expense Splitting                P3         Future

------------------------------------------------------------------------

# 5. Recommended Technology Direction

## Backend

-   Node.js
-   TypeScript
-   Express.js
-   PostgreSQL
-   Prisma ORM
-   Redis
-   AWS SQS
-   AWS Lambda where asynchronous/serverless execution is useful
-   JWT authentication
-   Docker
-   REST APIs

## Frontend

-   React
-   TypeScript
-   Tailwind CSS
-   React Router
-   Redux Toolkit where global state is justified

## Testing & Development

-   Postman
-   Unit tests
-   Integration tests
-   ESLint
-   Prettier
-   Git/GitHub
-   Docker Compose for local infrastructure

## Future AI Layer

-   LLM API
-   Structured tool/function calling
-   Controlled financial query services
-   Retrieval/query layer over application data

**Important:** The AI layer must never receive unrestricted database
access or arbitrary SQL execution privileges.

------------------------------------------------------------------------

# 6. High-Level Architecture

``` text
React Client
     |
     v
REST API
     |
     v
Node.js / Express
     |
     +--------------------+
     |                    |
     v                    v
Auth Module          Finance Modules
                         |
          +--------------+---------------+
          |              |               |
          v              v               v
      PostgreSQL       Redis           Services
                                          |
                                          v
                                       SQS
                                          |
                                          v
                                      Workers
                                          |
                         +----------------+----------------+
                         |                                 |
                         v                                 v
                 Notification Engine              Intelligence Engine
                                                           |
                                                           v
                                                     AI Assistant
```

------------------------------------------------------------------------

# 7. Core Domain Model

Initial domain entities:

``` text
User
Category
Account
Transaction
Expense
Income
Transfer
Budget
BudgetCategory
```

Phase 2:

``` text
RecurringTransaction
Subscription
Notification
```

Phase 3/4:

``` text
Merchant
Receipt
ImportJob
ImportTransaction
```

Phase 5/6:

``` text
FinancialInsight
SavingsGoal
AIConversation
AIQuery
```

Future:

``` text
Family
FamilyMember
ExpenseSplit
AuditLog
```

------------------------------------------------------------------------

# 8. Important Financial Rules

These rules must be treated as business rules, not UI behavior.

## Rule 1 --- Transfer is not an Expense

Example:

``` text
HDFC → Cash = ₹10,000
```

Balances change, but total net worth does not.

## Rule 2 --- Expense reduces an Account

``` text
HDFC = ₹50,000
Expense = ₹2,000
HDFC = ₹48,000
```

## Rule 3 --- Income increases an Account

``` text
Salary = ₹60,000
```

## Rule 4 --- Transaction Ownership

A user can only access transactions belonging to their authorized
account/user scope.

## Rule 5 --- Financial Calculations

All monetary calculations must avoid floating-point errors.

Use an appropriate decimal/numeric representation in PostgreSQL and
application code.

## Rule 6 --- Idempotency

Operations that may be retried must not create duplicate financial
transactions.

------------------------------------------------------------------------

# 9. Feature Roadmap

## PHASE 0 --- Engineering Foundation

### FEAT-000 --- Project Foundation

**Status:** Complete / In Progress

Tasks:

-   Project structure.
-   TypeScript configuration.
-   Environment configuration.
-   Database connection.
-   Prisma setup.
-   Error handling.
-   Request validation.
-   Logging.
-   API response conventions.
-   Configuration management.
-   Docker setup.
-   Health-check endpoint.

### Definition of Done

-   Application starts successfully.
-   Database connection works.
-   Health endpoint works.
-   Errors have a consistent structure.
-   Environment variables are validated.
-   Code follows project conventions.

------------------------------------------------------------------------

# 10. PHASE 1 --- Authentication

## FEAT-001 --- User Registration

**Status:** Completed

Capabilities:

-   Register user.
-   Validate input.
-   Hash password.
-   Prevent duplicate accounts.
-   Persist user.
-   Return safe response.

## FEAT-002 --- Login

Tasks:

-   Validate credentials.
-   Compare password hash.
-   Generate access token.
-   Generate refresh token.
-   Return authenticated session.

## FEAT-003 --- Refresh Token

Tasks:

-   Validate refresh token.
-   Rotate/reissue tokens where appropriate.
-   Revoke invalid/expired sessions.
-   Protect against token reuse.

## FEAT-004 --- Logout

Tasks:

-   Revoke refresh session/token.
-   Ensure subsequent refresh attempts fail.

## FEAT-005 --- Password Recovery

Tasks:

-   Forgot password.
-   Reset token.
-   Token expiration.
-   Password reset.
-   Token invalidation.

## FEAT-006 --- Profile

Tasks:

-   Get profile.
-   Update profile.
-   Change password.

------------------------------------------------------------------------

# 11. PHASE 2 --- Core Financial Ledger

## FEAT-010 --- Category Management

Capabilities:

-   Create category.
-   Update category.
-   Delete/archive category.
-   List categories.
-   Support parent/subcategory.
-   User-owned custom categories.
-   Default system categories.

Acceptance examples:

``` text
Food
  Restaurant
  Grocery

Transport
  Fuel
  Cab
  Public Transport
```

------------------------------------------------------------------------

## FEAT-011 --- Account Management

Support:

``` text
Bank Account
Cash
Credit Card
Debit Card
Wallet
UPI
```

Capabilities:

-   Create account.
-   Update account.
-   Archive account.
-   View balance.
-   List accounts.
-   Account transaction history.

------------------------------------------------------------------------

## FEAT-012 --- Expense Creation

Expense fields:

``` text
amount
category
account
merchant
description
transactionDate
paymentMethod
tags
notes
```

Capabilities:

-   Create expense.
-   Get expense.
-   Update expense.
-   Delete/archive expense.
-   List expenses.
-   Filter expenses.
-   Pagination.
-   Date range filtering.
-   Category filtering.
-   Account filtering.

------------------------------------------------------------------------

## FEAT-013 --- Income

Support:

``` text
Salary
Freelance
Business
Interest
Cashback
Other
```

Capabilities:

-   Create income.
-   Update income.
-   Delete/archive income.
-   List income.
-   Filter income.

------------------------------------------------------------------------

## FEAT-014 --- Transfers

Capabilities:

-   Transfer between accounts.
-   Debit source account.
-   Credit destination account.
-   Do not classify transfer as spending.
-   Maintain transaction linkage.

Example:

``` text
HDFC -₹10,000
Cash +₹10,000
```

Both records should reference the same transfer operation.

------------------------------------------------------------------------

## FEAT-015 --- Transaction History

Provide a unified transaction view:

``` text
Income
Expense
Transfer
```

Filters:

``` text
date
type
account
category
merchant
amount range
```

------------------------------------------------------------------------

# 12. PHASE 3 --- Budgeting

## FEAT-020 --- Monthly Budget

Example:

``` text
September 2026

Total Budget: ₹45,000
```

## FEAT-021 --- Category Budget

Example:

``` text
Food          ₹8,000
Transport     ₹5,000
Shopping      ₹7,000
Entertainment ₹3,000
```

## FEAT-022 --- Budget Utilization

Calculate:

``` text
spent
remaining
percentageUsed
status
```

Statuses:

``` text
SAFE
WARNING
CRITICAL
EXCEEDED
```

Thresholds should be configurable.

## FEAT-023 --- Budget Alerts

Trigger alerts when:

``` text
80%
90%
100%
```

or configured thresholds are reached.

------------------------------------------------------------------------

# 13. PHASE 4 --- Automation

## FEAT-030 --- Recurring Transactions

Examples:

``` text
Rent
Internet
Gym
Salary
Insurance
```

Fields:

``` text
frequency
startDate
nextRunAt
lastRunAt
status
```

Support:

``` text
DAILY
WEEKLY
MONTHLY
YEARLY
```

## FEAT-031 --- Recurring Transaction Worker

Architecture:

``` text
Scheduler
   |
   v
Find due records
   |
   v
Queue job
   |
   v
Worker
   |
   v
Create transaction
   |
   v
Update nextRunAt
```

Requirements:

-   Idempotency.
-   Retry handling.
-   Dead-letter strategy.
-   Failure logging.

------------------------------------------------------------------------

## FEAT-032 --- Subscription Tracking

Track:

``` text
name
amount
billingCycle
nextBillingDate
category
account
status
```

Dashboard:

``` text
Monthly subscription cost
Annualized subscription cost
Upcoming renewals
```

------------------------------------------------------------------------

# 14. PHASE 5 --- Analytics

## FEAT-040 --- Monthly Summary

Show:

``` text
Total income
Total expenses
Net cash flow
Savings
Savings rate
```

## FEAT-041 --- Category Analytics

Examples:

``` text
Food: ₹8,400
Transport: ₹4,200
Shopping: ₹6,700
```

## FEAT-042 --- Month-over-Month Analysis

Example:

``` text
August Food: ₹6,800
September Food: ₹8,400

Change: +₹1,600
```

## FEAT-043 --- Merchant Analytics

Example:

``` text
Swiggy — ₹4,200
Amazon — ₹7,500
Uber — ₹2,100
```

## FEAT-044 --- Cash Flow Analytics

Calculate:

``` text
income
expenses
net cash flow
```

by:

``` text
day
week
month
```

------------------------------------------------------------------------

# 15. PHASE 6 --- Intelligence

This phase is where the project becomes a financial intelligence
platform.

## FEAT-050 --- Duplicate Transaction Detection

Compare:

``` text
amount
merchant
date
account
time
reference
```

Generate:

``` text
POSSIBLE_DUPLICATE
```

Do not automatically delete transactions.

------------------------------------------------------------------------

## FEAT-051 --- Unusual Spending Detection

Start with deterministic/statistical rules.

Example:

``` text
3-month average Food spending = ₹7,000
Current month Food spending = ₹13,500
```

Generate:

``` text
Unusual spending detected.
```

Possible techniques:

``` text
moving average
standard deviation
z-score
category baseline
merchant baseline
```

------------------------------------------------------------------------

## FEAT-052 --- Spending Forecast

Estimate:

``` text
Projected month-end spending
```

Inputs:

``` text
current spending
days elapsed
historical spending
day-of-week patterns
recurring expenses
```

Output example:

``` text
Current: ₹25,000
Projected: ₹51,200
Budget: ₹45,000

Projected overage: ₹6,200
```

Forecasts must be clearly labeled as estimates.

------------------------------------------------------------------------

## FEAT-053 --- Spending Pattern Detection

Detect patterns such as:

``` text
Weekend spending
Salary-cycle spending
Merchant concentration
Category growth
Frequent small transactions
Large one-off transactions
```

Example insight:

``` text
Weekend spending is significantly higher
than weekday spending.
```

------------------------------------------------------------------------

## FEAT-054 --- "What Changed?" Engine

Question:

``` text
Why did I spend more this month?
```

System compares periods and identifies major contributors.

Output structure:

``` text
Overall change
Top contributing categories
Top merchants
One-time expenses
Recurring changes
```

------------------------------------------------------------------------

# 16. PHASE 7 --- Savings & Planning

## FEAT-060 --- Savings Goals

Example:

``` text
Goal: Laptop
Target: ₹120,000
Saved: ₹42,000
Target Date: March 2027
```

Calculate:

``` text
remaining
required monthly saving
progress percentage
```

## FEAT-061 --- What-If Simulator

Example:

``` text
"What if I reduce food spending by ₹3,000/month?"
```

Calculate:

``` text
Monthly impact
Annual impact
Goal impact
```

Keep this as a deterministic calculation engine before adding AI.

------------------------------------------------------------------------

# 17. PHASE 8 --- Receipt & Import Intelligence

## FEAT-070 --- Receipt Upload

Capabilities:

-   Upload receipt.
-   Store metadata.
-   Secure file access.
-   Link receipt to transaction.

## FEAT-071 --- Receipt OCR

Pipeline:

``` text
Receipt
  |
  v
OCR
  |
  v
Extract merchant
Extract amount
Extract date
Extract items
  |
  v
Create draft transaction
  |
  v
User confirmation
```

Never silently create a financial transaction from uncertain OCR data.

------------------------------------------------------------------------

## FEAT-072 --- CSV Bank Statement Import

Pipeline:

``` text
Upload CSV
   |
Parse
   |
Normalize
   |
Validate
   |
Duplicate detection
   |
Category suggestions
   |
Preview
   |
User confirmation
   |
Import
```

------------------------------------------------------------------------

# 18. PHASE 9 --- AI Financial Assistant

## FEAT-080 --- Natural Language Queries

Examples:

``` text
How much did I spend on food last month?

What were my biggest expenses this month?

How much did I spend on Swiggy in the last 3 months?

Which category increased the most?

How much do I spend on subscriptions?
```

## AI Architecture

``` text
User question
     |
     v
Intent / tool selection
     |
     v
Controlled application service
     |
     v
Database query
     |
     v
Structured result
     |
     v
LLM explanation
```

Possible tools:

``` text
getMonthlySummary()
getCategorySummary()
getMerchantSpending()
getBudgetStatus()
getRecurringPayments()
getCashFlow()
getSpendingTrend()
getSavingsGoalStatus()
```

### Security Requirement

The LLM must not:

-   Execute arbitrary SQL.
-   Access another user's data.
-   Modify transactions without explicit authorization.
-   Delete financial data.
-   Bypass application authorization.

------------------------------------------------------------------------

# 19. PHASE 10 --- India-Focused Features

Potential future features:

``` text
UPI transaction parsing
UPI screenshot parsing
Indian merchant recognition
INR formatting
Indian bank statement formats
WhatsApp expense entry
```

## WhatsApp Flow

``` text
WhatsApp
   |
Webhook
   |
Message parser
   |
Expense service
   |
PostgreSQL
   |
Confirmation
```

Example:

``` text
"Uber 420"

→ Merchant: Uber
→ Amount: ₹420
→ Suggested category: Transport
→ Date: Today
```

Require confirmation where parsing confidence is low.

------------------------------------------------------------------------

# 20. PHASE 11 --- Shared Finance

Future capabilities:

## FEAT-100 --- Family/Shared Accounts

``` text
Family
 ├── User A
 ├── User B
 └── User C
```

Implement:

``` text
RBAC
permissions
shared budgets
shared accounts
audit logs
```

## FEAT-101 --- Expense Splitting

Example:

``` text
Dinner = ₹2,400

A = ₹800
B = ₹800
C = ₹800
```

Track:

``` text
owed
paid
settled
```

------------------------------------------------------------------------

# 21. Notification Architecture

Notification events:

``` text
BUDGET_WARNING
BUDGET_EXCEEDED
RECURRING_PAYMENT_DUE
SUBSCRIPTION_RENEWAL
UNUSUAL_SPENDING
FORECAST_OVER_BUDGET
GOAL_MILESTONE
MONTHLY_REPORT
```

Architecture:

``` text
Domain Event
    |
    v
SQS / Queue
    |
    v
Notification Worker
    |
    +--> Email
    +--> Push
    +--> Future WhatsApp
```

------------------------------------------------------------------------

# 22. API Design Convention

Use resource-oriented REST APIs.

Example:

``` text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout

GET    /api/v1/categories
POST   /api/v1/categories
PATCH  /api/v1/categories/:id
DELETE /api/v1/categories/:id

GET    /api/v1/accounts
POST   /api/v1/accounts
PATCH  /api/v1/accounts/:id

GET    /api/v1/transactions
POST   /api/v1/transactions/:id

GET    /api/v1/expenses
POST   /api/v1/expenses
GET    /api/v1/expenses/:id
PATCH  /api/v1/expenses/:id

GET    /api/v1/budgets
POST   /api/v1/budgets

GET    /api/v1/analytics/monthly
GET    /api/v1/analytics/categories
GET    /api/v1/analytics/cash-flow
```

Do not create APIs just because they are listed here. Validate the
domain design and existing code before implementation.

------------------------------------------------------------------------

# 23. Standard Feature Development Process

Every feature must follow this workflow.

``` text
1. Read project context
2. Read relevant rules
3. Understand existing architecture
4. Perform R&D
5. Write/update feature specification
6. Identify affected entities
7. Design API contract
8. Design database changes
9. Identify security implications
10. Identify edge cases
11. Implement
12. Add tests
13. Create/update Postman collection
14. Run validation
15. Update documentation
16. Update feature status
```

------------------------------------------------------------------------

# 24. AI-Native Development Rules

This document is the product roadmap, not permission for AI to implement
everything automatically.

Before implementation, AI should determine:

### Existing System

-   What already exists?
-   Which files implement the relevant behavior?
-   Which modules/services can be reused?
-   What conventions are already established?

### Impact Analysis

Identify:

``` text
Controllers
Routes
Services
Repositories
Schemas
Database
Middleware
Tests
Postman
Documentation
```

### Implementation Principle

**Prefer modifying existing abstractions over creating duplicate
abstractions.**

Before creating a new utility/service:

1.  Search the repository.
2.  Check whether equivalent functionality exists.
3.  Reuse if appropriate.
4.  Extend if appropriate.
5.  Create new code only when justified.

------------------------------------------------------------------------

# 25. Feature Specification Template

Every new feature should have a spec similar to this:

``` markdown
# FEAT-XXX — Feature Name

## Status
PLANNED | R&D | READY | IN_PROGRESS | TESTING | COMPLETED

## Objective

What problem does this feature solve?

## User Story

As a user,
I want to ...
so that ...

## Functional Requirements

1.
2.
3.

## Non-Functional Requirements

- Security
- Performance
- Reliability
- Observability

## Data Model Changes

### Tables

### Fields

### Relationships

## API Contract

### Endpoint

### Request

### Response

### Errors

## Business Rules

1.
2.
3.

## Edge Cases

1.
2.
3.

## Authorization

Who can perform each operation?

## Validation

Input validation requirements.

## Testing

### Unit Tests

### Integration Tests

### API Tests

## Postman

Requests that must exist:

- ...
- ...

## Documentation

Files that must be updated:

- ...

## Definition of Done

- [ ] Implementation
- [ ] Validation
- [ ] Tests
- [ ] Postman
- [ ] Documentation
- [ ] Error handling
- [ ] Security review
```

------------------------------------------------------------------------

# 26. Definition of Done

A feature is NOT complete merely because the endpoint works.

A feature is complete only when:

``` text
[ ] Requirements implemented
[ ] Existing code reviewed
[ ] Database migration completed
[ ] Validation implemented
[ ] Authorization verified
[ ] Error handling implemented
[ ] Unit tests added where appropriate
[ ] Integration/API tests added
[ ] Postman request/collection updated
[ ] Documentation updated
[ ] Edge cases tested
[ ] Logs/observability considered
[ ] No unrelated code changed
[ ] Lint/typecheck/build passes
```

------------------------------------------------------------------------

# 27. Postman-First Feature Practice

For every feature, maintain:

``` text
postman/
  ExpenseTracker.postman_collection.json
  environments/
    local.json
```

When implementing a feature, AI should update the collection as part of
the same feature.

Example:

``` text
FEAT-012 Expense

POST /expenses
GET /expenses
GET /expenses/:id
PATCH /expenses/:id
DELETE /expenses/:id
```

The developer should not need to manually recreate requests after
implementation.

------------------------------------------------------------------------

# 28. Testing Strategy

## Unit Tests

Test:

``` text
business rules
calculations
validators
utility functions
forecasting logic
anomaly detection
```

## Integration Tests

Test:

``` text
API
database
authentication
authorization
transaction workflows
```

## Important Financial Test Cases

Always test:

``` text
duplicate transaction
negative amount
zero amount
unauthorized transaction
cross-user access
transfer accounting
budget boundary
recurring transaction retry
timezone/date boundary
decimal precision
concurrent transaction updates
```

------------------------------------------------------------------------

# 29. Security Requirements

Minimum security baseline:

``` text
Password hashing
JWT validation
Refresh token security
Authorization checks
Input validation
SQL/ORM safety
Rate limiting
Secure headers
CORS configuration
Environment secrets
File upload validation
Audit logging for sensitive operations
```

Never trust:

``` text
userId from request body
account ownership from client
category ownership from client
financial totals from client
```

Derive ownership from authenticated server-side context.

------------------------------------------------------------------------

# 30. Performance Requirements

Initial targets:

-   Paginate transaction lists.
-   Index frequently queried columns.
-   Avoid N+1 database queries.
-   Use Redis only where caching provides measurable value.
-   Avoid loading entire transaction histories into memory.
-   Use background jobs for expensive work.
-   Use database aggregation for analytics where appropriate.

Potential indexes:

``` text
Transaction(userId, transactionDate)
Transaction(accountId, transactionDate)
Transaction(categoryId, transactionDate)
Transaction(merchantId, transactionDate)
Budget(userId, month)
RecurringTransaction(nextRunAt, status)
```

Validate indexes against actual query patterns before adding them.

------------------------------------------------------------------------

# 31. Observability

Introduce:

``` text
structured logs
request IDs
error IDs
job IDs
database query monitoring
queue monitoring
failed job tracking
```

Future metrics:

``` text
API latency
error rate
queue depth
worker failure rate
transaction creation rate
AI query latency
```

------------------------------------------------------------------------

# 32. R&D Backlog

Before implementing advanced features, research:

## R&D-001

Financial ledger modeling.

## R&D-002

PostgreSQL money/decimal handling.

## R&D-003

Idempotency strategies.

## R&D-004

Recurring job architecture.

## R&D-005

Redis caching strategy.

## R&D-006

SQS retry/dead-letter design.

## R&D-007

Receipt OCR providers.

## R&D-008

Bank statement parsing.

## R&D-009

Spending anomaly detection.

## R&D-010

Forecasting methods.

## R&D-011

Natural-language-to-tool architecture.

## R&D-012

AI data access security.

## R&D-013

WhatsApp webhook architecture.

## R&D-014

Shared-account authorization model.

------------------------------------------------------------------------

# 33. Suggested Development Order

Use this exact sequence unless R&D reveals a dependency that requires
change.

``` text
01 Foundation
02 Registration
03 Login
04 Refresh Token
05 Logout
06 Profile
07 Categories
08 Accounts
09 Expenses
10 Income
11 Transfers
12 Transaction History
13 Budgets
14 Budget Alerts
15 Recurring Transactions
16 Subscriptions
17 Notifications
18 Monthly Analytics
19 Category Analytics
20 Merchant Analytics
21 Cash Flow
22 Duplicate Detection
23 Spending Anomaly Detection
24 Spending Forecast
25 Savings Goals
26 What-If Simulator
27 Receipt Upload
28 OCR
29 CSV Import
30 AI Natural Language Queries
31 AI "What Changed?" Insights
32 WhatsApp Entry
33 Family Finance
34 Expense Splitting
```

------------------------------------------------------------------------

# 34. Current Progress Tracker

Update this section after every completed feature.

  Feature                           Status
  --------------------------------- -----------
  FEAT-001 Registration             COMPLETED
  FEAT-002 Login                    COMPLETED
  FEAT-003 Refresh Token            COMPLETED
  FEAT-004 Logout                   COMPLETED
  FEAT-005 Password Recovery        PLANNED
  FEAT-006 Profile                  COMPLETED
  FEAT-010 Categories               COMPLETED
  FEAT-011 Accounts                 COMPLETED
  FEAT-012 Expenses                 COMPLETED
  FEAT-013 Income                   COMPLETED
  FEAT-014 Transfers                COMPLETED
  FEAT-015 Transaction History      COMPLETED
  FEAT-020 Monthly Budget           PLANNED
  FEAT-021 Category Budget          PLANNED
  FEAT-022 Budget Utilization       PLANNED
  FEAT-023 Budget Alerts            PLANNED
  FEAT-030 Recurring Transactions   PLANNED
  FEAT-031 Recurring Worker         PLANNED
  FEAT-032 Subscriptions            PLANNED
  FEAT-040 Monthly Summary          PLANNED
  FEAT-041 Category Analytics       PLANNED
  FEAT-042 MoM Analysis             PLANNED
  FEAT-043 Merchant Analytics       PLANNED
  FEAT-044 Cash Flow                PLANNED
  FEAT-050 Duplicate Detection      PLANNED
  FEAT-051 Anomaly Detection        PLANNED
  FEAT-052 Forecast                 PLANNED
  FEAT-053 Pattern Detection        PLANNED
  FEAT-054 What Changed             PLANNED
  FEAT-060 Savings Goals            PLANNED
  FEAT-061 What-If Simulator        PLANNED
  FEAT-070 Receipt Upload           PLANNED
  FEAT-071 OCR                      PLANNED
  FEAT-072 CSV Import               PLANNED
  FEAT-080 AI Assistant             PLANNED
  FEAT-100 Family Finance           PLANNED
  FEAT-101 Expense Splitting        PLANNED

------------------------------------------------------------------------

# 35. AI Agent Operating Instructions

When asked:

> "What should I implement next?"

AI should:

1.  Read this roadmap.
2.  Read the current project context.
3.  Read current feature status.
4.  Find the first incomplete feature whose dependencies are satisfied.
5.  Explain why it is next.
6.  Perform R&D if required.
7.  Create/update the feature specification.
8.  Implement only the requested feature.
9.  Update Postman.
10. Update status/documentation.

When asked to implement a feature:

``` text
Do not jump directly into coding.
```

First produce:

``` text
Understanding
↓
Existing code impact
↓
Requirements
↓
R&D findings
↓
Implementation plan
↓
Database/API changes
↓
Edge cases
↓
Implementation
↓
Tests
↓
Postman
↓
Documentation
```

------------------------------------------------------------------------

# 36. AI Agent Guardrails

AI must:

-   Follow existing project rules.
-   Read `AGENTS.md` if present.
-   Read `project.md` if present.
-   Read relevant `.cursor/rules`.
-   Treat this roadmap as product direction, not as permission to ignore
    repository constraints.
-   Never expose secrets.
-   Never invent existing APIs or database fields.
-   Never silently change unrelated modules.
-   Never delete financial data without explicit product requirements.
-   Preserve backward compatibility where applicable.
-   Ask for clarification when requirements conflict.
-   Prefer small, reviewable changes.
-   Update documentation after meaningful architecture changes.

------------------------------------------------------------------------

# 37. Documentation Structure

Recommended project structure:

``` text
docs/
├── BRD_EXPENSE_TRACKER.md
├── architecture/
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   └── API_DESIGN.md
├── features/
│   ├── FEAT-001-registration.md
│   ├── FEAT-002-login.md
│   ├── FEAT-010-categories.md
│   └── ...
├── research/
│   ├── R&D-001-ledger-model.md
│   ├── R&D-002-money-handling.md
│   └── ...
└── decisions/
    ├── ADR-001-database.md
    ├── ADR-002-authentication.md
    └── ...
```

------------------------------------------------------------------------

# 38. Product Success Criteria

The project should eventually allow a user to:

### Track

``` text
Income
Expenses
Transfers
Accounts
Categories
Merchants
Subscriptions
```

### Plan

``` text
Budgets
Savings Goals
Recurring Payments
```

### Understand

``` text
Monthly spending
Category trends
Merchant trends
Cash flow
Month-over-month changes
```

### Detect

``` text
Duplicates
Unusual transactions
Budget risk
Recurring payment changes
```

### Predict

``` text
Month-end spending
Budget overrun
Savings trajectory
```

### Ask

``` text
Natural-language financial questions
```

------------------------------------------------------------------------

# 39. Long-Term Product Differentiation

The application should not compete only on:

``` text
expense CRUD
pie charts
budget CRUD
```

The differentiating layer should be:

``` text
Personal Financial Intelligence
```

The product should progressively move from:

``` text
                    BASIC
                      |
                      v
              Expense Recording
                      |
                      v
                Budget Tracking
                      |
                      v
                  Analytics
                      |
                      v
               Pattern Detection
                      |
                      v
                  Prediction
                      |
                      v
              Personalized Insights
                      |
                      v
             Natural Language Finance
```

The key product question becomes:

> **"What useful decision can the application help the user make from
> their financial data?"**

That question should guide future feature prioritization.

------------------------------------------------------------------------

# 40. Immediate Next Steps

Current known progress:

``` text
FEAT-001 Registration → COMPLETED
```

Next recommended sequence:

``` text
FEAT-002 Login
FEAT-003 Refresh Token
FEAT-004 Logout
FEAT-005 Password Recovery
FEAT-006 Profile
FEAT-010 Categories
FEAT-011 Accounts
FEAT-012 Expenses
```

For each feature, create:

``` text
Research
Feature Spec
Implementation
Tests
Postman
Documentation
Status Update
```

**This document should remain the high-level source of truth. Detailed
implementation decisions belong in individual feature specs and ADRs.**
