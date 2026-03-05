---
name: pr-review
description: Review pull requests against team standards for the Loan Management System
---

# PR Review Skill

## Review Checklist
- [ ] **CI Checks**: Ensure lint, typecheck, test, and build pass
- [ ] **Type Safety**: No `any` types; Zod schemas match Prisma models
- [ ] **Data Isolation**: All loan/client/transaction queries filter by `userId`
- [ ] **Security**: Proper `auth()` or `validateUserAuthentication` on new API routes
- [ ] **Financial Logic**: Loan calculations, installment amounts, and penalties are correct
- [ ] **Performance**: No heavy imports in client components, no N+1 queries
- [ ] **Tests**: New logic has unit tests; critical flows have E2E tests

## Code Quality Standards
- **Imports**: Use absolute imports (`@/lib/utils`)
- **Components**: Leverage existing `src/components/ui` primitives
- **State**: Use hooks or React Query, not prop drilling
- **Styling**: Tailwind CSS utility classes
- **Forms**: React Hook Form with Zod validation

## Documentation Expectations
- New env vars added to `.env.example`
- Complex loan/financial logic in `src/lib` has TSDoc comments
- UI changes verified on mobile
- New API endpoints documented in code comments
