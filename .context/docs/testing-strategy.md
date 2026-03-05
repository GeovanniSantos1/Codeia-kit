---
type: doc
name: testing-strategy
description: Test frameworks, patterns, coverage requirements, and quality gates
category: testing
generated: 2026-01-19
updated: 2026-03-04
status: filled
scaffoldVersion: "2.0.0"
---

# Testing Strategy

## Overview
We employ a "Testing Trophy" approach: static analysis (TypeScript/ESLint), unit tests for business logic, integration tests for API boundaries, and targeted E2E tests for critical user journeys.

## Test Types

### Static Analysis
- **Tools**: TypeScript & ESLint
- **Focus**: Type safety, syntax errors, potential bugs
- **Gate**: Must pass before other tests run

### Unit Tests
- **Framework**: Vitest 4.0.7
- **Files**: `src/**/*.spec.ts` or `tests/unit/**/*.spec.ts`
- **Focus**: Pure functions in `src/lib` (especially `src/lib/loans/calculations.ts`), hooks, and independent components
- **Mocking**: External dependencies (Clerk, Asaas, Prisma) via `vi.mock()`
- **Key areas**: Loan interest calculation, installment generation, penalty calculation, credit validation/deduction

### Integration Tests
- **Framework**: Vitest
- **Files**: `tests/unit/api/**/*.spec.ts`
- **Focus**: API route handlers — verify controller-service-response chain
- **Examples**: Loan creation, client CRUD, transaction recording

### E2E Tests
- **Framework**: Playwright 1.55.0
- **Files**: `tests/e2e/**/*.spec.ts`
- **Focus**: Critical user paths: sign up, create loan, manage clients, view dashboard, admin panel
- **Auth Bypass**: `E2E_AUTH_BYPASS=1` for testing without real Clerk sessions

## Running Tests
```bash
# Unit/integration tests
npm run test:unit

# Unit tests in watch mode (TDD)
npm run test:unit -- --watch

# E2E tests (headless)
npm run test:e2e

# E2E tests with UI
npx playwright test --ui

# Coverage report
npm run test:unit -- --coverage
```

## Quality Gates
- **CI/CD**: All tests run on Pull Request
- **Coverage**: >80% on `src/lib` (business logic, especially loan calculations and credit system)
- **Linting**: `npm run lint` must pass
- **Build**: `npm run build` must succeed
- **Type Check**: `npm run typecheck` must pass

## Troubleshooting
- **Flaky E2E**: Use `await page.waitFor...` instead of fixed timeouts
- **Database**: Ensure test DB is migrated (`npm run db:reset`)
- **Timeouts**: Increase timeout in `playwright.config.ts` for CI environments
