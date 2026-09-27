# Expense Tracker — Frontend Roadmap

**Document Type:** Frontend Implementation Roadmap  
**Status:** Living Document  
**Version:** 1.0  
**Parent:** `docs/FRONTEND_BRD.md`  
**Product BRD:** `docs/BRD_EXPENSE_TRACKER.md`

## 1. Purpose

This document converts the Frontend BRD into an executable development roadmap.

Use it to answer:
- What should be implemented next?
- What is the dependency of a frontend feature?
- Which backend feature must already exist?
- What screens/components are required?
- What should be tested?
- When is a feature complete?

The Frontend BRD remains the detailed frontend source of truth.

## 2. Development Philosophy

Build the frontend as a production-quality application, not a collection of disconnected screens.

```text
Feature-first
    ↓
API-driven
    ↓
Reusable UI
    ↓
Consistent UX
    ↓
Tested
    ↓
Documented
```

Prefer vertical slices where practical:

```text
Backend API
    ↓
Frontend API layer
    ↓
Query / Mutation
    ↓
Feature components
    ↓
Page
    ↓
Dashboard integration
    ↓
Tests
```

## 3. Target Technology Stack

### Application
- Next.js
- TypeScript
- Next.js App Router
- React
- Tailwind CSS

### UI
- shadcn/ui
- Lucide React
- Recharts

### State
- TanStack Query — server state
- Redux Toolkit — client/global UI state only

### Forms
- React Hook Form
- Zod

### Testing
- Vitest
- React Testing Library
- Playwright

### Quality
- ESLint
- Prettier
- TypeScript strict mode
- Git/GitHub
- CI checks

## 4. Roadmap Overview

```text
F0  Foundation
        ↓
F1  Authentication
        ↓
F2  Application Shell
        ↓
F3  Dashboard
        ↓
F4  Categories
        ↓
F5  Accounts
        ↓
F6  Transactions
        ↓
F7  Budgets
        ↓
──────── FRONTEND MVP ────────
        ↓
F8  Recurring Transactions
        ↓
F9  Subscriptions
        ↓
F10 Notifications
        ↓
F11 Analytics
        ↓
F12 Financial Intelligence
        ↓
F13 Savings Goals
        ↓
F14 What-if Simulator
        ↓
F15 Receipt / OCR
        ↓
F16 CSV Import
        ↓
F17 AI Assistant
        ↓
F18 India-focused Features
        ↓
F19 Shared Finance
        ↓
F20 Expense Splitting
```

## 5. Backend Dependency Map

```text
Backend Registration
        ↓
Frontend Authentication

Backend Accounts
        ↓
Frontend Accounts

Backend Categories
        ↓
Frontend Categories

Backend Expenses / Income / Transfers
        ↓
Frontend Transactions

Backend Budgets
        ↓
Frontend Budget UI

Backend Recurring
        ↓
Frontend Recurring UI

Backend Subscriptions
        ↓
Frontend Subscription UI

Backend Analytics
        ↓
Frontend Analytics

Backend Intelligence
        ↓
Frontend Insights

Backend Savings Goals
        ↓
Frontend Goals

Backend Receipt/OCR
        ↓
Frontend Receipt UI

Backend Import
        ↓
Frontend CSV Import

Backend AI Services
        ↓
Frontend AI Assistant
```

A frontend feature must not invent an API that does not exist.

# 6. Milestone F0 — Engineering Foundation

## FE-ROADMAP-001 — Next.js Project

Tasks:

```text
[ ] Create Next.js application
[ ] Configure TypeScript
[ ] Enable strict mode
[ ] Configure Tailwind
[ ] Configure shadcn/ui
[ ] Configure ESLint
[ ] Configure Prettier
[ ] Configure environment variables
[ ] Configure path aliases
[ ] Configure Git
```

## FE-ROADMAP-002 — API Client

```text
[ ] Centralized API client
[ ] Base URL
[ ] Common headers
[ ] API error normalization
[ ] Request IDs
[ ] Common response types
```

## FE-ROADMAP-003 — TanStack Query

```text
[ ] Query client
[ ] Provider
[ ] Query defaults
[ ] Mutation defaults
[ ] Query key conventions
```

Example keys:

```text
['accounts']
['account', accountId]
['transactions', filters]
['budgets', month]
['analytics', period]
```

## FE-ROADMAP-004 — Client State

Use Redux Toolkit only for genuine global client state:

```text
sidebar
theme
UI preferences
global client-only state
```

Do not store all API responses in Redux.

## FE-ROADMAP-005 — Shared UI

Create reusable primitives:

```text
Button
Input
Select
Textarea
Dialog
Drawer
Dropdown
Card
Table
Badge
Tabs
Tooltip
Toast
Skeleton
Alert
Pagination
Date Picker
Confirm Dialog
```

Financial UI:

```text
CurrencyDisplay
AmountDisplay
PercentageDisplay
TransactionTypeBadge
BudgetStatusBadge
```

# 7. Milestone F1 — Authentication

## FE-ROADMAP-010 — Registration

Backend dependency: `FEAT-001`

Route:

```text
/register
```

Tasks:

```text
[ ] Registration form
[ ] Zod schema
[ ] API integration
[ ] Loading state
[ ] Validation errors
[ ] API errors
[ ] Success handling
[ ] Redirect
```

## FE-ROADMAP-011 — Login

Backend dependency: `FEAT-002`

Route:

```text
/login
```

Tasks:

```text
[ ] Login form
[ ] Validation
[ ] API integration
[ ] Session initialization
[ ] Error handling
[ ] Redirect
```

## FE-ROADMAP-012 — Refresh Session

Backend dependency: `FEAT-003`

```text
[ ] Detect expired session
[ ] Refresh session
[ ] Retry original request where safe
[ ] Prevent refresh loops
[ ] Handle refresh failure
```

## FE-ROADMAP-013 — Logout

Backend dependency: `FEAT-004`

```text
[ ] Logout
[ ] Clear client state
[ ] Clear relevant query cache
[ ] Redirect to login
```

## FE-ROADMAP-014 — Password Recovery

Backend dependency: `FEAT-005`

Routes:

```text
/forgot-password
/reset-password
```

## FE-ROADMAP-015 — Profile

Backend dependency: `FEAT-006`

Route:

```text
/profile
```

Tasks:

```text
[ ] View profile
[ ] Update profile
[ ] Change password
[ ] Validation
```

# 8. Milestone F2 — Application Shell

## FE-ROADMAP-020 — Protected Layout

Create:

```text
Authenticated Layout
├── Sidebar
├── Header
├── Main Content
└── Global Feedback
```

Tasks:

```text
[ ] Protected layout
[ ] Sidebar
[ ] Header
[ ] User menu
[ ] Notifications entry
[ ] Mobile navigation
[ ] Responsive behavior
```

## FE-ROADMAP-021 — Global UX States

```text
[ ] Loading
[ ] Skeleton
[ ] Empty
[ ] Error
[ ] Retry
[ ] Success
[ ] Confirmation
```

# 9. Milestone F3 — Dashboard

## FE-ROADMAP-030 — Dashboard Shell

Route:

```text
/dashboard
```

Initial widgets:

```text
[ ] Total balance
[ ] Income
[ ] Expenses
[ ] Savings / net cash flow
[ ] Recent transactions
[ ] Budget summary
[ ] Spending overview
```

## FE-ROADMAP-031 — Dashboard Integration

Progressively add:

```text
[ ] Subscription summary
[ ] Recurring payment summary
[ ] Budget alerts
[ ] Analytics
[ ] Insights
[ ] Forecast
[ ] Goals
```

# 10. Milestone F4 — Categories

Backend dependency: `FEAT-010`

## FE-ROADMAP-040 — Category Management

Route:

```text
/categories
```

Tasks:

```text
[ ] List categories
[ ] Parent/child hierarchy
[ ] Create
[ ] Edit
[ ] Archive
[ ] System categories
[ ] User categories
```

# 11. Milestone F5 — Accounts

Backend dependency: `FEAT-011`

## FE-ROADMAP-050 — Account Management

Route:

```text
/accounts
```

Tasks:

```text
[ ] Account cards/list
[ ] Account type
[ ] Balance
[ ] Create
[ ] Edit
[ ] Archive
```

## FE-ROADMAP-051 — Account Details

Route:

```text
/accounts/:id
```

Tasks:

```text
[ ] Account balance
[ ] Account statistics
[ ] Account transactions
[ ] Filters
[ ] Pagination
```

# 12. Milestone F6 — Transactions

This is the first major daily-use workflow.

## FE-ROADMAP-060 — Transaction List

Backend dependency: `FEAT-015`

Route:

```text
/transactions
```

Tasks:

```text
[ ] Unified transaction table
[ ] Expense
[ ] Income
[ ] Transfer
[ ] Search
[ ] Date filters
[ ] Type filters
[ ] Account filters
[ ] Category filters
[ ] Merchant filters
[ ] Amount range
[ ] Pagination
```

## FE-ROADMAP-061 — Add Expense

Backend dependency: `FEAT-012`

```text
[ ] Expense form
[ ] Amount
[ ] Category
[ ] Account
[ ] Merchant
[ ] Description
[ ] Transaction date
[ ] Payment method
[ ] Tags
[ ] Notes
[ ] Validation
[ ] Success feedback
```

## FE-ROADMAP-062 — Expense Details

```text
[ ] Details
[ ] Edit
[ ] Delete/archive
[ ] Confirmation
```

## FE-ROADMAP-063 — Income

Backend dependency: `FEAT-013`

```text
[ ] Income form
[ ] Income list
[ ] Details
[ ] Edit
[ ] Delete/archive
```

## FE-ROADMAP-064 — Transfers

Backend dependency: `FEAT-014`

```text
[ ] Source account
[ ] Destination account
[ ] Amount
[ ] Transfer confirmation
[ ] Transfer history
```

Important:

```text
Transfer ≠ Expense
```

# 13. Milestone F7 — Budgeting

Backend dependencies:

```text
FEAT-020 Monthly Budget
FEAT-021 Category Budget
FEAT-022 Budget Utilization
FEAT-023 Budget Alerts
```

## FE-ROADMAP-070 — Budget Dashboard

Route:

```text
/budgets
```

Tasks:

```text
[ ] Monthly budget
[ ] Total budget
[ ] Total spent
[ ] Remaining
[ ] Utilization
[ ] Status
```

## FE-ROADMAP-071 — Category Budgets

```text
[ ] Category budget list
[ ] Category progress
[ ] Remaining amount
[ ] Utilization
[ ] Status
```

## FE-ROADMAP-072 — Budget Alerts

```text
[ ] Warning
[ ] Critical
[ ] Exceeded
[ ] Configured thresholds
```

# 14. Frontend MVP Checkpoint

At this point:

```text
Authentication
     ↓
Dashboard
     ↓
Accounts
     ↓
Categories
     ↓
Transactions
     ↓
Income
     ↓
Transfers
     ↓
Budgets
```

The user should be able to complete the core financial workflow end-to-end.

### MVP Acceptance Flow

```text
Register
   ↓
Login
   ↓
Create Account
   ↓
Create/Select Category
   ↓
Add Expense
   ↓
Add Income
   ↓
Transfer Money
   ↓
Create Budget
   ↓
View Dashboard
   ↓
View Transactions
```

# 15. Milestone F8 — Recurring Transactions

Backend dependencies:

```text
FEAT-030 Recurring Transactions
FEAT-031 Recurring Worker
```

## FE-ROADMAP-080

Route:

```text
/recurring
```

Tasks:

```text
[ ] List
[ ] Create
[ ] Edit
[ ] Pause
[ ] Resume
[ ] Frequency
[ ] Start date
[ ] Next run
[ ] Last run
[ ] Status
```

# 16. Milestone F9 — Subscriptions

Backend dependency: `FEAT-032`

## FE-ROADMAP-090

Route:

```text
/subscriptions
```

Tasks:

```text
[ ] Subscription list
[ ] Monthly cost
[ ] Annualized cost
[ ] Billing cycle
[ ] Next billing date
[ ] Status
[ ] Upcoming renewals
```

# 17. Milestone F10 — Notifications

## FE-ROADMAP-100

Route:

```text
/notifications
```

Tasks:

```text
[ ] Notification center
[ ] Read/unread
[ ] Mark as read
[ ] Related navigation
[ ] Notification badge
[ ] Empty state
```

Potential events:

```text
BUDGET_WARNING
BUDGET_EXCEEDED
RECURRING_PAYMENT_DUE
SUBSCRIPTION_RENEWAL
UNUSUAL_SPENDING
FORECAST_OVER_BUDGET
GOAL_MILESTONE
MONTHLY_REPORT
```

# 18. Milestone F11 — Analytics

Backend dependencies:

```text
FEAT-040 Monthly Summary
FEAT-041 Category Analytics
FEAT-042 MoM Analysis
FEAT-043 Merchant Analytics
FEAT-044 Cash Flow
```

## FE-ROADMAP-110 — Analytics Dashboard

Route:

```text
/analytics
```

```text
[ ] Monthly summary
[ ] Income
[ ] Expenses
[ ] Net cash flow
[ ] Savings
[ ] Savings rate
[ ] Spending trend
```

## FE-ROADMAP-111 — Category Analytics

```text
[ ] Category chart
[ ] Category ranking
[ ] Category trend
[ ] Period comparison
```

## FE-ROADMAP-112 — Month-over-Month

```text
[ ] Period selector
[ ] Previous/current comparison
[ ] Absolute change
[ ] Percentage change
[ ] Top contributors
```

## FE-ROADMAP-113 — Merchant Analytics

```text
[ ] Top merchants
[ ] Merchant spending
[ ] Merchant trend
```

## FE-ROADMAP-114 — Cash Flow

```text
[ ] Income chart
[ ] Expense chart
[ ] Net cash flow
[ ] Day
[ ] Week
[ ] Month
```

# 19. Milestone F12 — Financial Intelligence

Backend dependencies:

```text
FEAT-050 Duplicate Detection
FEAT-051 Anomaly Detection
FEAT-052 Forecast
FEAT-053 Pattern Detection
FEAT-054 What Changed
```

## FE-ROADMAP-120 — Insights

Route:

```text
/insights
```

```text
[ ] Insight cards
[ ] Severity/status
[ ] Supporting data
[ ] Related navigation
[ ] Review/dismiss where supported
```

## FE-ROADMAP-121 — Duplicate Detection

```text
[ ] Possible duplicate indicator
[ ] Review
[ ] Keep both
[ ] Dismiss
```

Never silently delete financial transactions.

## FE-ROADMAP-122 — Unusual Spending

```text
[ ] Unusual spending card
[ ] Historical baseline
[ ] Category comparison
[ ] Merchant comparison
```

## FE-ROADMAP-123 — Forecast

```text
[ ] Current spending
[ ] Projected month-end
[ ] Budget
[ ] Projected overage
[ ] Forecast explanation
```

Clearly label forecasts as estimates.

## FE-ROADMAP-124 — Spending Patterns

```text
[ ] Weekend patterns
[ ] Salary-cycle patterns
[ ] Merchant concentration
[ ] Category growth
[ ] Frequent small transactions
[ ] Large one-off transactions
```

## FE-ROADMAP-125 — What Changed?

Route:

```text
/insights/what-changed
```

```text
[ ] Overall change
[ ] Top categories
[ ] Top merchants
[ ] One-time expenses
[ ] Recurring changes
```

# 20. Milestone F13 — Savings Goals

Backend dependency: `FEAT-060`

## FE-ROADMAP-130

Route:

```text
/goals
```

```text
[ ] Goal list
[ ] Create
[ ] Edit
[ ] Progress
[ ] Target amount
[ ] Saved amount
[ ] Remaining
[ ] Target date
[ ] Required monthly saving
```

# 21. Milestone F14 — What-if Simulator

Backend dependency: `FEAT-061`

## FE-ROADMAP-140

Route:

```text
/simulator
```

Example:

```text
Reduce Food spending by ₹3,000/month

Monthly impact
+₹3,000

Annual impact
+₹36,000

Goal impact
...
```

Initial implementation must be deterministic. Do not introduce AI until the deterministic calculation engine is reliable.

# 22. Milestone F15 — Receipt Upload

Backend dependency: `FEAT-070`

## FE-ROADMAP-150

Route:

```text
/imports/receipt
```

```text
[ ] Upload area
[ ] Drag/drop
[ ] File validation
[ ] Preview
[ ] Upload progress
[ ] Processing state
[ ] Failure state
```

# 23. Milestone F16 — OCR Review

Backend dependency: `FEAT-071`

Flow:

```text
Receipt
   ↓
Upload
   ↓
OCR
   ↓
Extracted Data
   ↓
Review
   ↓
User Confirmation
   ↓
Transaction
```

Tasks:

```text
[ ] Merchant
[ ] Amount
[ ] Date
[ ] Items
[ ] Category
[ ] Account
[ ] Confidence/review indicators
[ ] Confirm
[ ] Cancel
```

Never silently create a transaction from uncertain OCR data.

# 24. Milestone F17 — CSV Import

Backend dependency: `FEAT-072`

## FE-ROADMAP-170

Route:

```text
/imports/csv
```

Flow:

```text
Upload
   ↓
Parse
   ↓
Normalize
   ↓
Validate
   ↓
Duplicate Detection
   ↓
Category Suggestions
   ↓
Preview
   ↓
User Confirmation
   ↓
Import
```

Tasks:

```text
[ ] Upload
[ ] File validation
[ ] Column mapping
[ ] Preview
[ ] Validation errors
[ ] Duplicate indicators
[ ] Category suggestions
[ ] Import confirmation
[ ] Import progress
[ ] Import result
```

# 25. Milestone F18 — AI Financial Assistant

Backend dependency: `FEAT-080`

## FE-ROADMAP-180

Route:

```text
/assistant
```

Suggested questions:

```text
How much did I spend on food last month?

What were my biggest expenses?

How much did I spend on Swiggy?

Which category increased the most?

How much do I spend on subscriptions?

Why did I spend more this month?
```

Tasks:

```text
[ ] Chat interface
[ ] Message history
[ ] Suggested questions
[ ] Loading state
[ ] Streaming if backend supports it
[ ] Structured result rendering
[ ] Error/retry
```

Security:

The frontend must not provide unrestricted database access to the AI layer.

# 26. Milestone F19 — India-focused Features

Potential future UI:

```text
UPI transaction parsing
UPI screenshot parsing
Indian merchant recognition
Indian bank statement formats
WhatsApp expense entry
```

Maintain support for:

```text
INR
₹ formatting
Indian categories
UPI
Cash
Bank
Debit Card
Credit Card
Wallet
```

# 27. Milestone F20 — Shared Finance

Potential routes:

```text
/family
/family/members
/family/budgets
```

Tasks:

```text
[ ] Family overview
[ ] Member management
[ ] Roles
[ ] Permissions
[ ] Shared accounts
[ ] Shared budgets
[ ] Activity/audit view
```

# 28. Milestone F21 — Expense Splitting

Backend dependency: `FEAT-101`

Route:

```text
/splits
```

Example:

```text
Dinner
₹2,400

User A
₹800

User B
₹800

User C
₹800
```

Track:

```text
Owed
Paid
Settled
```

# 29. Critical User Journeys

## Journey 1 — New User

```text
Register
 ↓
Login
 ↓
Dashboard
 ↓
Create Account
 ↓
Create Category
 ↓
Create Budget
```

## Journey 2 — Daily Expense

```text
Login
 ↓
Dashboard
 ↓
Add Expense
 ↓
Transaction Created
 ↓
Dashboard Updated
 ↓
Budget Updated
```

## Journey 3 — Income

```text
Add Income
 ↓
Account Balance Updated
 ↓
Dashboard Updated
 ↓
Cash Flow Updated
```

## Journey 4 — Transfer

```text
Select Source
 ↓
Select Destination
 ↓
Transfer Amount
 ↓
Source Balance Decreases
 ↓
Destination Balance Increases
 ↓
Transfer appears in history
 ↓
Expense totals unchanged
```

## Journey 5 — Budget

```text
Create Budget
 ↓
Create Expense
 ↓
Budget Utilization Changes
 ↓
Status Changes if threshold crossed
```

## Journey 6 — Analytics

```text
Create Transactions
 ↓
Open Analytics
 ↓
Monthly Summary
 ↓
Category Analytics
 ↓
Cash Flow
 ↓
MoM Comparison
```

## Journey 7 — Intelligence

```text
Transactions
 ↓
Analytics
 ↓
Insight Generated
 ↓
User Reviews Insight
 ↓
User Takes Action
```

# 30. Testing Roadmap

## Foundation

Set up:

```text
Vitest
React Testing Library
Playwright
```

## Core MVP

Prioritize:

```text
Authentication
Expense creation
Income creation
Transfer
Budget
Dashboard
```

## Later

Add tests for:

```text
Analytics
Insights
Forecast
Goals
Import
AI Assistant
```

# 31. Responsive Roadmap

Responsive behavior must be implemented feature-by-feature.

Every feature must be checked for:

```text
Desktop
Tablet
Mobile
```

Critical mobile workflows:

```text
Add Expense
Add Income
Transfer
View Transactions
View Budget
View Notifications
```

# 32. Accessibility Roadmap

Every feature must include:

```text
[ ] Keyboard navigation
[ ] Focus states
[ ] Semantic markup
[ ] Form labels
[ ] Accessible errors
[ ] Accessible dialogs
[ ] Screen-reader status
[ ] Contrast
[ ] Non-color status indicators
```

# 33. Performance Roadmap

Apply progressively:

```text
Phase 1
Correct API/query architecture

Phase 2
Pagination

Phase 3
Query caching

Phase 4
Code splitting

Phase 5
Lazy loading

Phase 6
Large-list optimization

Phase 7
Performance monitoring
```

Avoid premature optimization.

# 34. Feature Definition of Done

Every roadmap feature is complete only when:

```text
[ ] Requirements reviewed
[ ] Backend dependency verified
[ ] UI implemented
[ ] API integrated
[ ] Validation implemented
[ ] Loading state
[ ] Empty state
[ ] Error state
[ ] Success state
[ ] Responsive behavior
[ ] Accessibility reviewed
[ ] Authentication/authorization considered
[ ] Unit/component tests
[ ] E2E test where appropriate
[ ] TypeScript passes
[ ] ESLint passes
[ ] Build passes
[ ] No duplicated API logic
[ ] No duplicated financial business logic
[ ] Documentation updated
[ ] Feature status updated
```

# 35. AI-Native Development Workflow

For every feature:

```text
Read Context
     ↓
Read Product BRD
     ↓
Read Frontend BRD
     ↓
Read Rules
     ↓
Review Existing Code
     ↓
Check Backend Dependency
     ↓
R&D
     ↓
Feature Specification
     ↓
UI / UX Plan
     ↓
API Contract
     ↓
State Strategy
     ↓
Edge Cases
     ↓
Implementation
     ↓
Tests
     ↓
Validation
     ↓
Documentation
     ↓
Status Update
```

Do not jump directly from a feature request to coding.

# 36. AI Agent Rules

When asked:

> "What should I implement next?"

The AI should:

1. Read `BRD_EXPENSE_TRACKER.md`.
2. Read `FRONTEND_BRD.md`.
3. Read this roadmap.
4. Read current frontend status.
5. Read backend status.
6. Check feature dependencies.
7. Identify the first valid incomplete frontend feature.
8. Explain why it is next.
9. Perform R&D when needed.
10. Create/update the feature specification.
11. Implement only the requested feature.
12. Add/update tests.
13. Validate.
14. Update documentation.
15. Update roadmap status.

# 37. AI Frontend Guardrails

```text
[ ] Read AGENTS.md
[ ] Read project.md
[ ] Read relevant .cursor/rules
[ ] Search before creating reusable components
[ ] Search before creating API abstractions
[ ] Reuse existing UI components
[ ] Reuse existing API logic
[ ] Never invent API endpoints
[ ] Never invent API response fields
[ ] Never duplicate backend financial rules
[ ] Never expose secrets
[ ] Never bypass authorization
[ ] Avoid unnecessary Redux state
[ ] Avoid unnecessary Client Components
[ ] Avoid unrelated changes
[ ] Add tests for meaningful behavior
[ ] Update documentation
```

# 38. Progress Tracker

Update after each completed feature.

```text
Foundation
FE-F00  Frontend Foundation             COMPLETED

Authentication
FE-F01  Registration                    COMPLETED
FE-F02  Login                           COMPLETED
FE-F03  Session / Refresh               COMPLETED
FE-F04  Logout                          COMPLETED
FE-F05  Password Recovery               BLOCKED
FE-F06  Profile                         COMPLETED

Application
FE-F10  Dashboard Shell                 COMPLETED

Categories
FE-F20  Category Management             COMPLETED

Accounts
FE-F30  Account Management              COMPLETED
FE-F31  Account Details                 COMPLETED

Transactions
FE-F40  Transaction List                COMPLETED
FE-F41  Add Expense                     COMPLETED
FE-F42  Transaction Details             COMPLETED
FE-F43  Edit/Delete Expense             COMPLETED
FE-F44  Income                          COMPLETED
FE-F45  Transfers                       COMPLETED

Budgets
FE-F50  Monthly Budget                  COMPLETED
FE-F51  Category Budget                 COMPLETED
FE-F52  Budget Status                   COMPLETED
FE-F53  Budget Alerts                   COMPLETED

Automation
FE-F60  Recurring Transactions          PLANNED
FE-F61  Subscriptions                   PLANNED

Notifications
FE-F70  Notification Center             PLANNED

Analytics
FE-F80  Analytics Dashboard             PLANNED
FE-F81  Category Analytics              PLANNED
FE-F82  Month-over-Month                PLANNED
FE-F83  Merchant Analytics              PLANNED
FE-F84  Cash Flow                       PLANNED

Intelligence
FE-F90  Insights                        PLANNED
FE-F91  Duplicate Detection             PLANNED
FE-F92  Unusual Spending                PLANNED
FE-F93  Spending Forecast               PLANNED
FE-F94  Spending Patterns               PLANNED
FE-F95  What Changed                    PLANNED

Planning
FE-F100 Savings Goals                   PLANNED
FE-F101 What-if Simulator               PLANNED

Import
FE-F110 Receipt Upload                  PLANNED
FE-F111 OCR Review                      PLANNED
FE-F112 CSV Import                      PLANNED

AI
FE-F120 AI Assistant                    PLANNED

Future
FE-F130 India-focused Features          PLANNED
FE-F140 Shared Finance                  PLANNED
FE-F150 Expense Splitting               PLANNED
```

# 39. Git / Branch Strategy

Feature branches:

```text
feature/FE-F41-add-expense
feature/FE-F50-budget-dashboard
feature/FE-F80-analytics-dashboard
```

Commit examples:

```text
feat(auth): add login page
feat(accounts): add account management
feat(expenses): add expense form
feat(budget): add budget dashboard
test(expenses): add expense creation tests
docs(frontend): update roadmap
```

Keep branches small and reviewable.

# 40. Recommended Execution Order

```text
01 Next.js foundation
02 API client
03 Query/state infrastructure
04 Shared UI
05 Authentication
06 Application shell
07 Dashboard shell
08 Categories
09 Accounts
10 Transactions
11 Income
12 Transfers
13 Budgets
14 Budget alerts
```

At this point:

```text
          FRONTEND MVP
```

Then:

```text
15 Recurring
16 Subscriptions
17 Notifications
18 Analytics
19 Intelligence
20 Goals
21 What-if
22 Receipt
23 OCR
24 CSV Import
25 AI Assistant
26 India features
27 Shared Finance
28 Expense Splitting
```

# 41. Final Product Evolution

```text
STAGE 1 — RECORD
Expenses
Income
Transfers
Accounts
Categories

        ↓

STAGE 2 — CONTROL
Budgets
Recurring
Subscriptions
Alerts

        ↓

STAGE 3 — UNDERSTAND
Dashboard
Analytics
Cash Flow
Trends

        ↓

STAGE 4 — DETECT
Duplicates
Anomalies
Patterns
Insights

        ↓

STAGE 5 — PREDICT
Forecast
Goals
What-if

        ↓

STAGE 6 — AUTOMATE INPUT
Receipt
OCR
CSV Import

        ↓

STAGE 7 — ASK
AI Financial Assistant
```

The ultimate goal is:

> **Build a frontend that turns financial records into understandable information, useful insights, and better financial decisions.**
