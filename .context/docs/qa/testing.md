---
slug: testing
category: testing
generatedAt: 2026-01-19T17:51:25.307Z
updatedAt: 2026-03-04
---

# How do I run and write tests?

## Testing

### Test Frameworks
- **Unit/Integration**: Vitest 4.0.7
- **E2E**: Playwright 1.55.0

### Running Tests

```bash
# Unit tests
npm run test:unit

# Unit tests in watch mode
npm run test:unit -- --watch

# E2E tests
npm run test:e2e

# E2E tests with browser UI
npx playwright test --ui

# Coverage report
npm run test:unit -- --coverage
```

### File Organization
- Unit tests: `tests/unit/**/*.spec.ts` or co-located `src/**/*.spec.ts`
- E2E tests: `tests/e2e/**/*.spec.ts`
- Test setup: `tests/setup.ts`

### Key Test Areas
- **Loan calculations**: Interest, installments, penalties (`src/lib/loans/calculations.ts`)
- **Credit system**: Validation, deduction, refund (`src/lib/credits/`)
- **API routes**: Loan CRUD, client CRUD, transaction recording
- **Critical paths (E2E)**: Sign up, create loan, manage clients, view dashboard

### Mocking
- External APIs (Clerk, Asaas, OpenRouter): `vi.mock()`
- Database: Mock Prisma client responses
- Time-sensitive logic: `vi.useFakeTimers()`
