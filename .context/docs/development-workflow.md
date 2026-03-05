---
type: doc
name: development-workflow
description: Day-to-day engineering processes, branching, and contribution guidelines
category: workflow
generated: 2026-01-19
updated: 2026-03-04
status: filled
scaffoldVersion: "2.0.0"
---

# Development Workflow

## Overview
This repository follows a standard feature-branch workflow. Developers work on isolated branches, validate changes locally, and submit Pull Requests for review. We prioritize type safety (TypeScript), domain correctness (loan calculations), and automated testing.

## Branching & Releases
- **Main Branch**: `main` — Stable, production-ready branch
- **Feature Branches**: `feature/description` or `fix/issue-id` — Short-lived branches for new work
- **Releases**: Tagged releases follow Semantic Versioning (vX.Y.Z)

## Local Development

1. **Setup Environment**:
   ```bash
   cp .env.example .env
   # Fill in: DATABASE_URL, Clerk keys, Asaas keys, OpenRouter key
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Database Setup**:
   ```bash
   npm run db:push    # Sync schema (prototyping)
   # or
   npm run db:migrate # Create migration (production)
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   # Access at http://localhost:5000
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

## Code Review Expectations
All changes must pass through a Pull Request (PR) review process.
- **CI Checks**: All automated checks (linting, build, tests) must pass
- **Type Safety**: No `any` types unless absolutely necessary and documented
- **Testing**: New features must include relevant unit or E2E tests
- **Domain Logic**: Loan calculations and financial logic require extra scrutiny
- **Data Isolation**: Verify all queries filter by `userId` for multi-tenant safety
- **Self-Review**: Check for console logs, commented-out code, and adherence to patterns

## Testing & Verification
Before submitting a PR, run:
- **Linting**: `npm run lint`
- **Type Checking**: `npm run typecheck`
- **Unit Tests**: `npm run test:unit` (Vitest)
- **E2E Tests**: `npm run test:e2e` (Playwright)

## Onboarding Tasks
New to the project? Start here:
1. **Explore the UI**: Run the app locally and navigate through Dashboard, Loans, Clients, Transactions, and Admin
2. **Review the Schema**: Read `prisma/schema.prisma` to understand the data model (Client, Loan, Installment, Transaction)
3. **Read the Docs**: Start with [`project-overview.md`](./project-overview.md) and [`architecture.md`](./architecture.md)
4. **Understand Calculations**: Review `src/lib/loans/calculations.ts` for interest, installments, and penalty logic

## Cross-References
- [`testing-strategy.md`](./testing-strategy.md) — Detailed testing practices
- [`tooling.md`](./tooling.md) — Scripts and tools
- [`glossary.md`](./glossary.md) — Domain terminology
