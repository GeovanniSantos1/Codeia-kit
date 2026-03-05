---
name: test-generation
description: Generate comprehensive test cases for loan calculations, API routes, and E2E flows
---

# Test Generation Skill

## Testing Frameworks
- **Unit**: Vitest 4.0.7 (`npm run test:unit`)
- **E2E**: Playwright 1.55.0 (`npm run test:e2e`)

## File Organization
- **Unit Tests**: `tests/unit/**/*.spec.ts` or co-located `src/**/*.spec.ts`
- **E2E Tests**: `tests/e2e/**/*.spec.ts`
- **Fixtures**: `tests/setup.ts` for global setup

## Key Test Areas

### Loan Calculations (High Priority)
- `calculateInterest(principal, rate)` — simple interest formula
- `calculateTotalDebt(principal, interest)` — sum
- `calculateInstallmentAmount(totalDebt, count)` — division and rounding
- `calculateDueDates(startDate, count, interval)` — date generation for all intervals
- `calculatePenalty(penaltyPerDay, daysOverdue)` — penalty math
- `generateInstallments(...)` — full installment generation

### Credit System
- `validateCreditsForFeature(userId, feature)` — balance checking
- `deductCreditsForFeature(userId, feature)` — deduction
- `refundCreditsForFeature(userId, feature)` — refund on failure

### API Routes
- Loan CRUD with auth and data isolation
- Client CRUD with search and pagination
- Transaction recording with type filtering
- Report endpoints (dashboard, today, overdue)

## Mocking Strategy
- **Clerk/Asaas/OpenRouter**: `vi.mock()` — no network requests
- **Database**: Mock Prisma client responses
- **Date/Time**: `vi.useFakeTimers()` for overdue and penalty calculations

## Coverage Requirements
- **Business Logic**: >80% for `src/lib/loans/calculations.ts` and `src/lib/credits/`
- **API Routes**: Test happy path + error cases for all CRUD endpoints
- **Critical E2E Paths**: Sign up, create loan, manage clients, view dashboard

## Example (Loan Calculation Test)
```typescript
import { describe, it, expect } from 'vitest';
import { calculateInterest, generateInstallments } from '@/lib/loans/calculations';

describe('calculateInterest', () => {
  it('should calculate simple interest correctly', () => {
    expect(calculateInterest(1000, 10)).toBe(100); // 1000 * 10/100
  });

  it('should handle zero interest rate', () => {
    expect(calculateInterest(1000, 0)).toBe(0);
  });
});

describe('generateInstallments', () => {
  it('should generate correct number of installments', () => {
    const installments = generateInstallments({
      principal: 1000,
      interestRate: 10,
      count: 5,
      interval: 'MONTHLY',
      startDate: new Date('2026-01-01'),
    });
    expect(installments).toHaveLength(5);
  });
});
```
