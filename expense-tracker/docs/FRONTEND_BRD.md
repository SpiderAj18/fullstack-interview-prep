# Expense Tracker — Frontend Product & Development Roadmap

**Document Type:** Frontend BRD + UI Architecture + Feature Roadmap  
**Status:** Living Document  
**Version:** 1.0  
**Parent Document:** `docs/BRD_EXPENSE_TRACKER.md`  
**Purpose:** Single source of truth for AI-assisted/spec-driven frontend development.

---/Users/ajaygupta/Downloads/FRONTEND_BRD.md /Users/ajaygupta/Downloads/FRONTEND_ROADMAP.md

## 1. Frontend Product Vision

Build a modern, responsive financial application that helps users:

- Record financial activity.
- Understand where money is going.
- Monitor account balances.
- Control spending through budgets.
- Track recurring payments and subscriptions.
- Explore financial trends.
- Understand unusual spending.
- Plan savings.
- Import financial information.
- Eventually ask questions about their finances using natural language.

The frontend follows the product principle:

**Record → Understand → Detect → Predict → Act**

The frontend is not merely a collection of CRUD screens. It should present financial information in a way that helps users make decisions.

---

## 2. Relationship With Backend BRD

The backend/product BRD remains the source of truth for:

- Product scope.
- Domain entities.
- Financial business rules.
- API/domain behavior.
- Security requirements.
- Backend feature dependencies.

This document is the frontend source of truth for:

- Screens and routes.
- Navigation.
- UI behavior.
- Frontend state management.
- API integration patterns.
- Forms and validation.
- Loading/error/empty states.
- Responsive behavior.
- Accessibility.
- Frontend testing.
- Frontend Definition of Done.

When frontend and backend requirements conflict, review the relevant backend feature specification or ADR rather than silently changing behavior.

---

## 3. Frontend Technology Stack

### Core

- Next.js
- TypeScript
- App Router
- React
- Tailwind CSS

### UI

- shadcn/ui
- Radix primitives where appropriate
- Lucide React
- Recharts

### Server State

- TanStack Query

Use it for transactions, accounts, categories, budgets, analytics, recurring transactions, subscriptions, notifications, and insights.

### Client State

- Redux Toolkit

Use only where global client state provides real value, such as UI state, preferences, sidebar state, and other genuinely shared client-only state.

Do not copy all server state into Redux.

### Forms and Validation

- React Hook Form
- Zod

Client validation never replaces backend validation.

### API

- Centralized API client.
- Axios or the project's approved HTTP abstraction.
- Centralized authentication/error handling.

### Testing

- Vitest
- React Testing Library
- Playwright

### Code Quality

- ESLint
- Prettier
- TypeScript strict mode
- Git/GitHub
- CI checks

---

## 4. High-Level Frontend Architecture

```text
                    Next.js Application
                           |
        +------------------+------------------+
        |                  |                  |
     App Router        UI Components      Features
        |                  |                  |
        +------------------+------------------+
                           |
                     TanStack Query
                           |
                       API Client
                           |
                           v
                    Node.js / Express
                           |
                    PostgreSQL / Redis
```

The backend remains responsible for:

- Authentication.
- Authorization.
- Financial calculations.
- Business rules.
- Data persistence.
- Background processing.
- Financial intelligence.

The frontend is responsible for:

- Presentation.
- User interaction.
- Client-side validation.
- Navigation.
- Server-state consumption.
- Safe user feedback.
- Visualization.

---

## 5. Recommended Frontend Project Structure

```text
frontend/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── transactions/
│   │   │   ├── accounts/
│   │   │   ├── categories/
│   │   │   ├── budgets/
│   │   │   ├── recurring/
│   │   │   ├── subscriptions/
│   │   │   ├── analytics/
│   │   │   ├── insights/
│   │   │   ├── goals/
│   │   │   ├── imports/
│   │   │   ├── assistant/
│   │   │   ├── notifications/
│   │   │   ├── profile/
│   │   │   └── settings/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── accounts/
│   │   ├── categories/
│   │   ├── budgets/
│   │   ├── recurring/
│   │   ├── subscriptions/
│   │   ├── analytics/
│   │   ├── notifications/
│   │   ├── insights/
│   │   ├── goals/
│   │   ├── imports/
│   │   └── assistant/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── forms/
│   │   ├── charts/
│   │   ├── tables/
│   │   └── feedback/
│   ├── lib/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── query/
│   │   ├── formatting/
│   │   └── utils/
│   ├── store/
│   ├── hooks/
│   ├── types/
│   └── config/
├── public/
├── tests/
└── package.json
```

Prefer feature-based organization. Reuse shared UI primitives rather than creating duplicate components.

---

## 6. Application Navigation

Primary navigation:

```text
Dashboard

Transactions
Accounts
Categories

Budgets
Recurring
Subscriptions

Analytics
Insights
Goals

Imports
AI Assistant

Notifications

Profile
Settings
```

Do not expose unfinished features as active production functionality.

---

## 7. Global UI Standards

Every API-driven page must define:

### Loading

- Skeletons where useful.
- Loading indicators for actions.
- Disabled submit buttons during mutations.

### Empty

Provide a useful explanation and primary action.

Example:

```text
No transactions yet.

Start by adding your first expense.

[Add Expense]
```

### Error

Provide:

- Human-readable message.
- Retry action where appropriate.
- Error/request ID when supplied.

### Success

Use toast or inline feedback for mutations.

### Confirmation

Required for destructive operations such as delete, archive, account removal, and irreversible import actions.

---

## 8. Financial UI Standards

### Currency

Default currency:

**INR (₹)**

Use centralized Indian-number formatting, for example:

```text
₹1,23,456.00
```

### Dates

Use a consistent timezone/date strategy. Do not assume the browser timezone equals the user's financial timezone.

### Amounts

The backend is the source of authoritative financial calculations. Avoid floating-point financial calculations in the frontend.

---

# 9. Frontend Feature Roadmap

## PHASE F0 — Foundation

### FE-F00 — Frontend Project Setup

Tasks:

- Next.js setup.
- TypeScript.
- Tailwind.
- shadcn/ui.
- ESLint.
- Prettier.
- Environment configuration.
- API client.
- TanStack Query.
- Redux Toolkit.
- React Hook Form.
- Zod.
- Vitest.
- React Testing Library.
- Playwright.

Definition of Done:

- Application builds.
- TypeScript passes.
- Lint passes.
- Test runner works.
- Environment variables are validated.
- API client works.
- Query provider works.
- Base layout works.

---

# 10. PHASE F1 — Authentication

## FE-F01 — Registration

Route:

```text
/register
```

Capabilities:

- Registration form.
- Client validation.
- Password validation.
- API integration.
- Loading state.
- Error handling.
- Success handling.

## FE-F02 — Login

Route:

```text
/login
```

Capabilities:

- Email/password.
- Validation.
- Authentication.
- Error handling.
- Redirect to dashboard.

## FE-F03 — Session / Refresh

Capabilities:

- Access-token handling according to backend contract.
- Refresh flow.
- Expired-session handling.
- Protected routes.
- Safe request retry where appropriate.

## FE-F04 — Logout

Capabilities:

- Logout.
- Session cleanup.
- Redirect to login.
- Clear relevant client/cache state.

## FE-F05 — Password Recovery

Routes:

```text
/forgot-password
/reset-password
```

## FE-F06 — Profile

Route:

```text
/profile
```

Capabilities:

- View profile.
- Update profile.
- Change password.

---

# 11. PHASE F2 — Application Shell

## FE-F10 — Dashboard Shell

Route:

```text
/dashboard
```

Initial sections:

- Account summary.
- Balance summary.
- Recent transactions.
- Budget summary.
- Spending overview.

The dashboard should progressively expand as backend capabilities become available.

---

# 12. PHASE F3 — Categories

## FE-F20 — Category Management

Route:

```text
/categories
```

Capabilities:

- List.
- Create.
- Edit.
- Archive.
- Parent category.
- Child category.
- System/default categories.
- User-owned categories.

Example:

```text
Food
 ├── Restaurant
 ├── Grocery
 └── Delivery

Transport
 ├── Fuel
 ├── Cab
 └── Public Transport
```

---

# 13. PHASE F4 — Accounts

## FE-F30 — Account Management

Route:

```text
/accounts
```

Capabilities:

- List accounts.
- Create.
- Edit.
- Archive.
- View balance.
- View account transactions.

Supported types:

```text
Bank Account
Cash
Credit Card
Debit Card
Wallet
UPI
```

## FE-F31 — Account Details

Route:

```text
/accounts/:id
```

Show:

- Current balance.
- Income.
- Expenses.
- Recent transactions.
- Account metadata.

---

# 14. PHASE F5 — Transactions

## FE-F40 — Unified Transaction List

Route:

```text
/transactions
```

Types:

```text
Income
Expense
Transfer
```

Filters:

```text
Date
Type
Account
Category
Merchant
Amount range
```

Capabilities:

- Pagination.
- Search where supported.
- Sorting where supported.
- Filter persistence where useful.

## FE-F41 — Add Expense

Fast-entry fields:

```text
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

## FE-F42 — Transaction Details

Route:

```text
/transactions/:id
```

Show:

- Amount.
- Type.
- Category.
- Account.
- Merchant.
- Date.
- Notes.
- Metadata.

## FE-F43 — Edit/Delete Expense

Capabilities:

- Edit.
- Delete/archive.
- Confirmation.
- Success/error feedback.

## FE-F44 — Income

Support:

- Salary.
- Freelance.
- Business.
- Interest.
- Cashback.
- Other.

## FE-F45 — Transfers

Clearly distinguish transfers from expenses.

Example:

```text
HDFC
-₹10,000

        ↓

Cash
+₹10,000
```

A transfer must not be presented as spending.

---

# 15. PHASE F6 — Budgets

## FE-F50 — Monthly Budget

Route:

```text
/budgets
```

Show:

```text
September 2026

Total Budget
₹45,000

Spent
₹32,400

Remaining
₹12,600

Utilization
72%
```

## FE-F51 — Category Budget

Example:

```text
Food
₹6,700 / ₹8,000

Transport
₹3,200 / ₹5,000

Shopping
₹6,900 / ₹7,000
```

## FE-F52 — Budget Status

Render backend-defined statuses:

```text
SAFE
WARNING
CRITICAL
EXCEEDED
```

Do not independently redefine financial thresholds in the frontend.

## FE-F53 — Budget Alerts

Show:

- 80%.
- 90%.
- 100%.
- Configured thresholds where supported.

---

# 16. PHASE F7 — Recurring & Subscriptions

## FE-F60 — Recurring Transactions

Route:

```text
/recurring
```

Show:

- Name.
- Amount.
- Frequency.
- Next run.
- Status.

Support:

```text
DAILY
WEEKLY
MONTHLY
YEARLY
```

## FE-F61 — Subscriptions

Route:

```text
/subscriptions
```

Show:

- Monthly subscription cost.
- Annualized cost.
- Upcoming renewals.
- Status.

---

# 17. PHASE F8 — Notifications

## FE-F70 — Notification Center

Route:

```text
/notifications
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

Capabilities:

- Read/unread.
- Mark as read.
- Open related feature.
- Filtering where required.

---

# 18. PHASE F9 — Analytics

## FE-F80 — Analytics Dashboard

Route:

```text
/analytics
```

Show:

- Total income.
- Total expenses.
- Net cash flow.
- Savings.
- Savings rate.
- Spending trend.

## FE-F81 — Category Analytics

Show:

- Category totals.
- Distribution.
- Trends.
- Period comparison.

## FE-F82 — Month-over-Month

Example:

```text
August Food
₹6,800

September Food
₹8,400

Change
+₹1,600
```

## FE-F83 — Merchant Analytics

Show:

- Top merchants.
- Merchant spending.
- Merchant trends.

## FE-F84 — Cash Flow

Show:

```text
Income
Expenses
Net cash flow
```

Support:

```text
Day
Week
Month
```

---

# 19. PHASE F10 — Financial Intelligence

## FE-F90 — Insights

Route:

```text
/insights
```

Display:

- Unusual spending.
- Duplicate warnings.
- Budget risk.
- Forecast warnings.
- Spending patterns.

Insights should communicate:

```text
What happened?
Why it matters?
What data supports it?
```

Do not present estimates as facts.

## FE-F91 — Duplicate Detection

Display possible duplicates without automatically deleting transactions.

Example:

```text
Possible duplicate

Swiggy
₹420
23 Sep
```

Actions:

```text
Review
Keep both
Dismiss
```

## FE-F92 — Unusual Spending

Show supporting information where available.

## FE-F93 — Spending Forecast

Example:

```text
Current spending
₹25,000

Projected month-end
₹51,200

Budget
₹45,000

Projected overage
₹6,200
```

Clearly label forecasts as estimates.

## FE-F94 — Spending Patterns

Potential patterns:

- Weekend spending.
- Salary-cycle spending.
- Merchant concentration.
- Category growth.
- Frequent small transactions.
- Large one-off transactions.

## FE-F95 — What Changed?

Route:

```text
/insights/what-changed
```

Show:

- Overall change.
- Top categories.
- Top merchants.
- One-time expenses.
- Recurring changes.

---

# 20. PHASE F11 — Savings & Planning

## FE-F100 — Savings Goals

Route:

```text
/goals
```

Show:

```text
Goal: Laptop

Target: ₹1,20,000
Saved: ₹42,000
Remaining: ₹78,000
Target Date: March 2027
```

Display:

- Progress.
- Remaining.
- Required monthly saving.

## FE-F101 — What-if Simulator

Route:

```text
/simulator
```

Example:

```text
What if I reduce food spending
by ₹3,000/month?
```

Show:

- Monthly impact.
- Annual impact.
- Goal impact.

Start with deterministic calculations before AI.

---

# 21. PHASE F12 — Receipt & Import

## FE-F110 — Receipt Upload

Route:

```text
/imports/receipt
```

Capabilities:

- Upload.
- Preview.
- Progress.
- Processing state.
- Error state.
- Secure access.

## FE-F111 — OCR Review

After OCR, show:

```text
Merchant
Amount
Date
Items
Category
Account
```

Require user review before transaction creation when confidence is uncertain.

## FE-F112 — CSV Import

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

Provide a clear preview before committing financial data.

---

# 22. PHASE F13 — AI Financial Assistant

## FE-F120 — AI Assistant

Route:

```text
/assistant
```

Example questions:

```text
How much did I spend on food last month?

What were my biggest expenses this month?

How much did I spend on Swiggy?

Which category increased the most?

How much do I spend on subscriptions?
```

UI may support:

- Conversation history.
- Suggested questions.
- Loading/streaming state if supported.
- Structured financial results.
- Retry behavior.

The frontend must never bypass backend authorization.

---

# 23. PHASE F14 — India-Focused Features

Future UI support:

```text
UPI transaction parsing
UPI screenshot parsing
Indian merchant recognition
INR formatting
Indian bank statement formats
WhatsApp expense entry
```

These should extend the existing manual-entry workflow rather than replace it prematurely.

---

# 24. PHASE F15 — Shared Finance

Future capabilities:

- Shared accounts.
- Shared budgets.
- Family members.
- Permissions.
- Expense splitting.
- Settlement status.

Routes may include:

```text
/family
/family/members
/family/budgets
/splits
```

The frontend must respect backend authorization.

---

# 25. Responsive Design

Support:

### Desktop

```text
Sidebar + content
```

### Tablet

```text
Collapsible sidebar
```

### Mobile

```text
Top bar
Drawer/bottom navigation where appropriate
Stacked cards
Mobile-friendly transaction entry
```

Critical mobile workflows:

- Add expense.
- Add income.
- Transfer.
- View budget.
- View transactions.
- View notifications.

---

# 26. Accessibility

Requirements:

- Keyboard navigation.
- Visible focus states.
- Semantic HTML.
- Accessible form labels.
- Accessible errors.
- Correct dialog behavior.
- Screen-reader-friendly status messages.
- Sufficient contrast.
- Do not rely only on color for financial status.

Example:

```text
EXCEEDED
```

should accompany any visual color treatment.

---

# 27. Performance

Initial requirements:

- Avoid unnecessary API requests.
- Cache server state with TanStack Query.
- Paginate large transaction lists.
- Virtualize very large lists when needed.
- Lazy-load heavy visualization modules where useful.
- Avoid unnecessary Client Components.
- Prefer Server Components where they provide meaningful benefit.
- Optimize receipt/image handling.
- Never load the entire transaction history into the browser unnecessarily.

---

# 28. Next.js Rendering Strategy

Use Next.js intentionally.

## Server Components

Prefer for:

- Static layouts.
- Non-interactive page structure.
- Server-renderable content where appropriate.

## Client Components

Use when requiring:

- User interaction.
- Browser APIs.
- Local state.
- Interactive forms.
- Charts.
- Modals.
- Drag/drop.
- Real-time UI.

Do not make the entire application a Client Component without a reason.

---

# 29. API Integration Convention

Each feature should own its API integration.

Example:

```text
features/
└── expenses/
    ├── api/
    │   ├── expense.api.ts
    │   ├── expense.queries.ts
    │   └── expense.mutations.ts
    ├── components/
    ├── hooks/
    ├── schemas/
    └── types/
```

Components should consume hooks/services rather than directly calling Axios/fetch.

Example:

```typescript
const { data, isLoading, error } = useExpenses(filters);
```

Avoid:

```typescript
axios.get(...)
```

directly inside UI components.

---

# 30. Query and Cache Strategy

Define query keys consistently:

```text
['expenses', filters]
['accounts']
['account', accountId]
['budgets', month]
['analytics', period]
```

After mutations, update or invalidate affected queries.

Example:

```text
Create expense
    ↓
Transactions
Dashboard
Budget
Analytics
```

Financial consistency takes priority over aggressive optimistic updates.

---

# 31. Authentication Strategy

Frontend behavior:

```text
Login
  ↓
Authenticated session
  ↓
API requests
  ↓
401
  ↓
Refresh session
  ↓
Retry where appropriate
  ↓
If refresh fails
  ↓
Logout
```

The exact token-storage strategy must match the backend authentication contract and be documented in an ADR.

---

# 32. Error Handling

Normalize API errors into a consistent frontend representation:

```text
{
  message,
  code,
  status,
  requestId
}
```

Frontend should map known errors to user-friendly messages.

Never expose:

- Stack traces.
- Database errors.
- Internal implementation details.
- Secrets.

---

# 33. Frontend Development Process

Every feature follows:

```text
1. Read backend BRD
2. Read frontend BRD
3. Read project context
4. Read AGENTS.md
5. Read relevant .cursor/rules
6. Review backend feature specification
7. Review API contract
8. Review existing frontend architecture
9. Perform UX/UI R&D
10. Define screens and user flows
11. Define component impact
12. Define API integration
13. Define state requirements
14. Define loading/error/empty states
15. Define accessibility requirements
16. Implement
17. Add tests
18. Run typecheck/lint/build
19. Run E2E where appropriate
20. Update documentation
21. Update feature status
```

Do not start coding immediately after receiving a feature request.

---

# 34. Frontend Feature Specification Template

```markdown
# FEAT-FXX — Feature Name

## Status

PLANNED | R&D | READY | IN_PROGRESS | TESTING | COMPLETED

## Parent Backend Feature

FEAT-XXX

## Objective

What problem does this feature solve?

## User Story

As a user,
I want to...
so that...

## User Flow

1.
2.
3.

## Routes

- `/...`

## Screens

- ...

## Components

- ...

## API Dependencies

- GET ...
- POST ...
- PATCH ...

## Query/Mutation Requirements

- ...

## Client State

- ...

## Server State

- ...

## Forms

- ...

## Validation

- ...

## Loading State

- ...

## Empty State

- ...

## Error State

- ...

## Success State

- ...

## Responsive Behavior

- Desktop
- Tablet
- Mobile

## Accessibility

- ...

## Security

- ...

## Testing

### Unit

### Component

### Integration

### E2E

## Definition of Done

- [ ] UI implemented
- [ ] API integrated
- [ ] Validation implemented
- [ ] Loading state
- [ ] Empty state
- [ ] Error state
- [ ] Success feedback
- [ ] Responsive
- [ ] Accessibility checked
- [ ] Tests added
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Build passes
- [ ] Documentation updated
```

---

# 35. Frontend Definition of Done

A feature is not complete merely because the page renders.

```text
[ ] Requirements implemented
[ ] Correct route
[ ] API integration complete
[ ] Authentication/authorization considered
[ ] Form validation
[ ] Loading state
[ ] Empty state
[ ] Error state
[ ] Success feedback
[ ] Responsive behavior
[ ] Accessibility considered
[ ] Unit/component tests where appropriate
[ ] E2E test for critical flow where appropriate
[ ] TypeScript passes
[ ] ESLint passes
[ ] Build passes
[ ] No unnecessary Client Components
[ ] No duplicated API logic
[ ] No duplicated business logic
[ ] Documentation updated
```

---

# 36. Testing Strategy

## Unit Tests

Test:

- Formatting utilities.
- Validation schemas.
- UI utility functions.
- Filter utilities.

## Component Tests

Test:

- Forms.
- Modals.
- Transaction forms.
- Budget cards.
- Account cards.
- Empty/error states.

## Integration Tests

Test:

- Authentication.
- Transaction creation.
- Budget interactions.
- API error behavior.

## E2E Tests

Critical flows:

```text
Register → Login → Dashboard

Login → Add Expense → Transaction appears

Add Expense → Budget utilization changes

Create Transfer → Account balances update correctly

Create Budget → Dashboard displays budget

Logout → Protected route inaccessible
```

---

# 37. Frontend Security Requirements

Never trust from the client:

```text
userId
account ownership
category ownership
financial totals
permissions
```

The backend remains authoritative.

Frontend responsibilities:

- Avoid exposing secrets.
- Validate inputs.
- Avoid unsafe HTML rendering.
- Handle authentication safely.
- Avoid leaking financial data through logs.
- Clear sensitive client state on logout.
- Respect backend authorization.

---

# 38. Observability

Eventually support:

- Error tracking.
- Request IDs.
- API timing.
- Client errors.
- Failed critical interactions.
- Route-level performance monitoring.

Potential future integration:

- Sentry or equivalent.

---

# 39. Frontend Documentation Structure

Recommended:

```text
docs/
├── BRD_EXPENSE_TRACKER.md
├── FRONTEND_BRD.md
├── architecture/
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API_DESIGN.md
│   └── FRONTEND_ARCHITECTURE.md
├── features/
│   ├── FEAT-001-registration.md
│   ├── FEAT-002-login.md
│   ├── FEAT-F01-registration.md
│   ├── FEAT-F02-login.md
│   └── ...
├── research/
│   └── frontend/
└── decisions/
    ├── ADR-001-database.md
    └── ADR-F001-nextjs.md
```

---

# 40. Recommended Frontend ADRs

```text
ADR-F001 — Why Next.js
ADR-F002 — Server State with TanStack Query
ADR-F003 — Client State with Redux Toolkit
ADR-F004 — Feature-Based Frontend Architecture
ADR-F005 — Authentication / Token Handling
ADR-F006 — Form Validation Strategy
ADR-F007 — Financial Formatting
ADR-F008 — Next.js Server vs Client Components
```

---

# 41. Development Order

Use this sequence unless a dependency requires change:

```text
01 Frontend Foundation
02 Authentication
03 Application Shell
04 Dashboard
05 Categories
06 Accounts
07 Transactions
08 Income
09 Transfers
10 Budgets
11 Budget Alerts
12 Recurring Transactions
13 Subscriptions
14 Notifications
15 Analytics
16 Financial Insights
17 Duplicate Detection
18 Spending Anomaly Detection
19 Spending Forecast
20 Spending Patterns
21 What Changed?
22 Savings Goals
23 What-if Simulator
24 Receipt Upload
25 OCR Review
26 CSV Import
27 AI Assistant
28 India-focused Features
29 Shared Finance
30 Expense Splitting
```

---

# 42. Vertical-Slice Development Strategy

Do not build only isolated pages.

Prefer vertical slices.

### Slice 1

```text
Authentication
+
Application Shell
+
Dashboard Shell
```

### Slice 2

```text
Accounts
+
Account Dashboard Widget
```

### Slice 3

```text
Transactions
+
Add Expense
+
Recent Transactions Widget
```

### Slice 4

```text
Budgets
+
Budget Dashboard Widget
```

This produces a usable application early.

---

# 43. Current Frontend Progress Tracker

Update after every completed feature.

```text
FE-F00 Frontend Foundation           COMPLETED
FE-F01 Registration                  COMPLETED
FE-F02 Login                         COMPLETED
FE-F03 Session/Refresh               COMPLETED
FE-F04 Logout                        COMPLETED
FE-F05 Password Recovery             BLOCKED
FE-F06 Profile                       COMPLETED

FE-F10 Dashboard Shell               COMPLETED

FE-F20 Categories                    COMPLETED

FE-F30 Accounts                      COMPLETED
FE-F31 Account Details               PLANNED

FE-F40 Transactions                  COMPLETED
FE-F41 Add Expense                   COMPLETED
FE-F42 Transaction Details           COMPLETED
FE-F43 Edit/Delete Expense           COMPLETED
FE-F44 Income                        COMPLETED
FE-F45 Transfers                     COMPLETED

FE-F50 Monthly Budget                COMPLETED
FE-F51 Category Budget               PLANNED
FE-F52 Budget Status                 COMPLETED
FE-F53 Budget Alerts                 COMPLETED

FE-F60 Recurring Transactions        PLANNED
FE-F61 Subscriptions                 PLANNED

FE-F70 Notifications                 PLANNED

FE-F80 Analytics Dashboard           PLANNED
FE-F81 Category Analytics            PLANNED
FE-F82 Month-over-Month              PLANNED
FE-F83 Merchant Analytics            PLANNED
FE-F84 Cash Flow                     PLANNED

FE-F90 Insights                      PLANNED
FE-F91 Duplicate Detection           PLANNED
FE-F92 Unusual Spending              PLANNED
FE-F93 Spending Forecast              PLANNED
FE-F94 Spending Patterns             PLANNED
FE-F95 What Changed                  PLANNED

FE-F100 Savings Goals                PLANNED
FE-F101 What-if Simulator            PLANNED

FE-F110 Receipt Upload               PLANNED
FE-F111 OCR Review                   PLANNED
FE-F112 CSV Import                   PLANNED

FE-F120 AI Assistant                 PLANNED

India Features                       PLANNED
Shared Finance                       PLANNED
Expense Splitting                   PLANNED
```

---

# 44. AI-Native Frontend Development Rules

When AI is asked:

> "What should I implement next?"

It should:

1. Read `BRD_EXPENSE_TRACKER.md`.
2. Read `FRONTEND_BRD.md`.
3. Read current frontend progress.
4. Read project context.
5. Read `AGENTS.md`.
6. Read relevant `.cursor/rules`.
7. Check backend feature dependencies.
8. Find the first incomplete frontend feature whose dependencies are satisfied.
9. Explain why it is next.
10. Perform R&D if required.
11. Create/update the frontend feature specification.
12. Implement only the requested feature.
13. Add tests.
14. Validate.
15. Update documentation.
16. Update frontend status.

---

# 45. AI Frontend Guardrails

AI must:

- Follow repository rules.
- Read `AGENTS.md` when present.
- Read `project.md` when present.
- Read relevant `.cursor/rules`.
- Review existing components before creating duplicates.
- Reuse existing UI primitives.
- Reuse existing API abstractions.
- Never invent backend endpoints.
- Never invent API response fields.
- Never duplicate backend financial calculations.
- Never expose secrets.
- Never bypass authorization.
- Avoid unnecessary global state.
- Avoid unnecessary Client Components.
- Avoid unrelated code changes.
- Preserve existing UX patterns.
- Add tests for meaningful behavior.
- Update documentation after architecture changes.

---

# 46. Product Success Criteria

The frontend should eventually allow a user to:

## Record

```text
Income
Expenses
Transfers
Accounts
Categories
Merchants
Subscriptions
```

## Plan

```text
Budgets
Savings Goals
Recurring Payments
```

## Understand

```text
Monthly spending
Category trends
Merchant trends
Cash flow
Month-over-month changes
```

## Detect

```text
Duplicates
Unusual transactions
Budget risk
Recurring payment changes
```

## Predict

```text
Month-end spending
Budget overrun
Savings trajectory
```

## Ask

```text
Natural-language financial questions
```

---

# 47. Immediate Frontend Next Steps

```text
1. Create Next.js frontend
2. Configure TypeScript
3. Configure Tailwind
4. Configure shadcn/ui
5. Configure TanStack Query
6. Configure Redux Toolkit
7. Configure API client
8. Configure React Hook Form + Zod
9. Configure testing
10. Build application layout
11. Build authentication
12. Build dashboard shell
13. Connect Accounts
14. Connect Categories
15. Connect Transactions
16. Connect Income
17. Connect Transfers
18. Connect Budgets
19. Add responsive/mobile behavior
20. Add production-quality loading/error/empty states
```

After the integrated MVP:

```text
Recurring
→ Subscriptions
→ Notifications
→ Analytics
→ Intelligence
→ Goals
→ Import/OCR
→ AI Assistant
```

---

# 48. Final Frontend Architecture Principle

The frontend should evolve with the backend but should not blindly mirror backend implementation details.

Backend:

```text
Business Rules
Financial Truth
Authorization
Persistence
Jobs
Intelligence
```

Frontend:

```text
Experience
Interaction
Presentation
Navigation
Validation
Visualization
User Feedback
```

The product should evolve from:

```text
Expense CRUD
      ↓
Financial Dashboard
      ↓
Budget Management
      ↓
Analytics
      ↓
Financial Intelligence
      ↓
Financial Planning
      ↓
AI Financial Assistant
```

The key question remains:

> **"What useful decision can this application help the user make from their financial data?"**
