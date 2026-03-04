---
type: doc
name: testing-strategy
description: Test frameworks, patterns, coverage requirements, and quality gates
category: testing
generated: 2026-01-19
status: filled
scaffoldVersion: "2.0.0"
---

# Testing Strategy

## Testing Strategy
We employ a "Testing Trophy" approach: a solid base of static analysis (Typescript/Lint), a layer of unit tests for business logic, integration tests for API boundaries, and a targeted set of E2E tests for critical user journeys. This ensures confidence in deployments without slowing down development.

## Test Types
- **Static Analysis**:
  - **Tool**: TypeScript & ESLint.
  - **Focus**: Type safety, syntax errors, and potential bugs.
  - **Gate**: Must pass before any other tests run.

- **Unit Tests**:
  - **Framework**: Vitest.
  - **Files**: `src/**/*.spec.ts` (co-located or in `tests/unit`).
  - **Focus**: Pure functions in `src/lib`, Hooks in `src/hooks`, and independent Components.
  - **Mocking**: Extensive mocking of external dependencies (Clerk, Asaas, DB).

- **Integration Tests**:
  - **Framework**: Vitest (using a test DB environment or mocks).
  - **Files**: `tests/unit/api/**/*.spec.ts`.
  - **Focus**: API Route handlers (`POST /api/subscribe`). Verifies that the Controller calls the Service and returns the correct Response.

- **E2E Tests**:
  - **Framework**: Playwright.
  - **Files**: `tests/e2e/**/*.spec.ts`.
  - **Focus**: Critical paths: Sign Up, Upgrade Plan, Admin Dashboard. These run against a running dev server.

## Running Tests
```bash
# Run all unit/integration tests
npm run test

# Run unit tests in watch mode (for TDD)
npm run test -- --watch

# Run E2E tests (headless)
npm run test:e2e

# Run E2E tests with UI
npx playwright test --ui

# Check coverage
npm run test -- --coverage
```

## Quality Gates
- **CI/CD**: All tests run on Pull Request.
- **Coverage**: Aim for >80% coverage on `src/lib` (Business Logic). Lower coverage is acceptable for UI glue code.
- **Linting**: `npm run lint` must return 0 exit code.
- **Build**: `npm run build` must succeed (verifies Typescript).

## Troubleshooting
- **Flaky Tests**: Often caused by race conditions in E2E. Use `await page.waitFor...` instead of fixed timeouts.
- **Database**: Ensure the local test DB is migrated (`npx prisma migrate reset`).
- **Timeouts**: If tests fail on CI but pass locally, increase the timeout config in `playwright.config.ts`.
