---
name: Test Generation
description: Generate comprehensive test cases for code
---

# Test Generation Skill

## Testing Frameworks
- **Unit**: Vitest (`npm run test`)
- **E2E**: Playwright (`npm run test:e2e`)

## File Organization
- **Unit Tests**: Co-located with source or in `tests/unit`. Pattern: `filename.spec.ts`.
- **E2E Tests**: Located in `tests/e2e`. Pattern: `feature-name.spec.ts`.
- **Fixtures**: `tests/setup.ts` for global setup.

## Mocking Strategy
- **External APIs**: Mock Clerk and Asaas calls using `vi.mock()`. Do not make network requests in unit tests.
- **Database**: Use a test database or mock Prisma client responses.
- **Date/Time**: Use `vi.useFakeTimers()` for time-sensitive logic (subscriptions, credits expiry).

## Coverage Requirements
- **Business Logic**: High coverage (>80%) for `src/lib/credits`, `src/lib/asaas`.
- **Utils**: High coverage for `src/lib/utils.ts`.
- **Critical Paths**: E2E tests must cover Sign Up, Login, Subscription Purchase, and Credit Usage.

## Example (Unit Test)
```typescript
import { describe, it, expect, vi } from 'vitest';
import { deductCredits } from '@/lib/credits/deduct';

describe('deductCredits', () => {
  it('should throw if insufficient credits', async () => {
    // Setup mocks
    await expect(deductCredits(userId, 100)).rejects.toThrow();
  });
});
```