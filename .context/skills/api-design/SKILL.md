---
name: api-design
description: Design RESTful APIs for the Loan Management System
---

# API Design Skill

## Patterns
- **Resource Oriented**: `/api/resources` (List), `/api/resources/[id]` (Detail/Update/Delete)
- **Controller/Service**: Route handlers (`route.ts`) parse request/auth, then call `src/lib` services
- **Response Envelope**: Standard JSON response format

## Existing API Structure
- `/api/loans` — Loan CRUD with installment generation
- `/api/clients` — Client CRUD with search/pagination
- `/api/transactions` — Transaction recording with filters
- `/api/reports/dashboard` — Aggregated loan metrics
- `/api/reports/today` — Today's due installments
- `/api/reports/overdue` — Overdue installments
- `/api/ai/chat` — Streaming AI chat
- `/api/credits/me` — Credit balance
- `/api/checkout` — Asaas payment initiation
- `/api/admin/*` — Admin management endpoints

## Naming Conventions
- **URLs**: Kebab-case, plural nouns (e.g., `/api/loans`, `/api/clients`)
- **Methods**:
  - `GET`: Retrieve (list or detail)
  - `POST`: Create or complex action
  - `PUT`: Full update
  - `DELETE`: Remove

## Request/Response
- **Request**: Validate body using Zod schemas
- **Auth**: Every route checks `await auth()` from `@clerk/nextjs/server`
- **Data Isolation**: All queries filter by `userId`
- **Response**:
  - Success: `{ data: T }` or direct JSON
  - Error: `{ error: { code: string, message: string } }` (via `ApiError`)
- **Status Codes**: 200, 201, 400, 401, 403, 404, 500

## Pagination Pattern
```typescript
// Query params: ?page=1&limit=20&search=query&status=ACTIVE
const page = parseInt(searchParams.get("page") || "1");
const limit = parseInt(searchParams.get("limit") || "20");
const skip = (page - 1) * limit;
```
