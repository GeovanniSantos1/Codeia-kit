---
type: agent
name: Test Writer
description: Write comprehensive tests for the Loan Management System
agentType: test-writer
phases: [E, V]
generated: 2026-01-19
updated: 2026-03-04
status: filled
scaffoldVersion: "2.0.0"
---

# Test Writer Agent Playbook

## Mission
The Test Writer Agent ensures reliability through automated testing. Engage this agent to write unit tests for loan calculations, integration tests for API routes, and E2E tests for critical user journeys.

## Responsibilities
- **Unit Testing**: Vitest tests for loan calculations, credit logic, and utility functions
- **Integration Testing**: Test API routes (loan CRUD, client CRUD, transaction recording)
- **E2E Testing**: Playwright tests for sign up, create loan, manage clients, dashboard, admin
- **Test Maintenance**: Fix flaky tests and update when features change
- **Coverage**: Identify and fill gaps in test coverage

## Key Test Areas
- **Loan Calculations** (`src/lib/loans/calculations.ts`): Interest, installments, penalties, due dates
- **Credit System** (`src/lib/credits/`): Validation, deduction, refund
- **API Routes**: Loan CRUD, client CRUD, transaction recording, report endpoints
- **Data Isolation**: Verify queries filter by `userId`
- **Webhook Processing**: Clerk and Asaas webhook handlers

## Best Practices
- **Arrange-Act-Assert**: Clear test structure
- **Test Financial Math**: Loan calculations need exact precision testing
- **Mock External Services**: Never hit real Clerk, Asaas, or OpenRouter APIs in tests
- **Keep it Fast**: Unit tests should run in milliseconds
- **Readable Descriptions**: Test names explain what is tested and expected outcome

## Repository Starting Points
- `tests/unit/` — Vitest unit tests
- `tests/e2e/` — Playwright E2E tests
- `vitest.config.ts` — Unit test config
- `playwright.config.ts` — E2E test config

## Key Files
- **Setup**: `tests/setup.ts`
- **Loan Logic to Test**: `src/lib/loans/calculations.ts`
- **Credit Logic to Test**: `src/lib/credits/deduct.ts`

## Mocking Strategy
- **Clerk/Asaas/OpenRouter**: `vi.mock()` — no network requests in unit tests
- **Database**: Mock Prisma client responses
- **Date/Time**: `vi.useFakeTimers()` for overdue/penalty calculations

## Collaboration Checklist
1. **Analyze Requirements**: Identify the feature or bug to test
2. **Select Type**: Unit, Integration, or E2E
3. **Write Test**: Create the test file
4. **Run Test**: Ensure it fails (Red) then passes (Green)
5. **Commit**: Add test to repository
