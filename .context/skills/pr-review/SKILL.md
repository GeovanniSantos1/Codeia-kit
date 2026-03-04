---
name: Pr Review
description: Review pull requests against team standards and best practices
---

# PR Review Skill

## Review Checklist
- [ ] **CI Checks**: Ensure GitHub Actions (lint, test, build) are green.
- [ ] **Type Safety**: Verify no `any` types are introduced; ensure Zod schemas match Prisma models where applicable.
- [ ] **Security**: Check for exposed secrets, proper `isAdmin` or `validateUserAuthentication` checks on new API routes.
- [ ] **Performance**: Look for heavy imports in client components or N+1 queries in loops.
- [ ] **Tests**: Ensure new logic has unit tests (`.spec.ts`) and E2E tests if it touches critical flows (checkout, auth).

## Code Quality Standards
- **Imports**: Use absolute imports (e.g., `@/lib/utils`) where configured.
- **Components**: UI components should leverage `src/components/ui` primitives.
- **State**: Complex state should use hooks (`src/hooks`) or Context, not prop drilling.
- **Styling**: Tailwind CSS utility classes preferred over arbitrary values.

## Documentation Expectations
- New env vars must be added to `.env.example` and `src/lib/onboarding/env-check.ts`.
- Complex logic in `src/lib` should have TSDoc comments.
- UI changes should verify responsiveness on mobile.