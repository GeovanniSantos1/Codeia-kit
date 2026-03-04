---
type: doc
name: development-workflow
description: Day-to-day engineering processes, branching, and contribution guidelines
category: workflow
generated: 2026-01-19
status: filled
scaffoldVersion: "2.0.0"
---

# Development Workflow

## Development Workflow
This repository follows a standard feature-branch workflow. Developers are expected to work on isolated branches, validate changes locally using the provided test suites, and submit Pull Requests for review. We prioritize code quality, type safety (TypeScript), and automated testing.

## Branching & Releases
- **Main Branch**: `main` - The stable, production-ready branch. Deploys automatically to production (if configured).
- **Feature Branches**: `feature/description` or `fix/issue-id` - Short-lived branches for new work.
- **Releases**: Tagged releases follow Semantic Versioning (vX.Y.Z).

## Local Development
Follow these steps to set up and run the project locally:

1. **Setup Environment**:
   ```bash
   cp .env.example .env
   # Fill in the required environment variables in .env (Database URL, Clerk keys, Asaas keys)
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Database Setup**:
   ```bash
   npx prisma migrate dev
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   # Access at http://localhost:3000
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

## Code Review Expectations
All changes must pass through a Pull Request (PR) review process.
- **CI Checks**: Ensure all automated checks (linting, build, tests) pass.
- **Self-Review**: Review your own code before requesting a review. Check for commented-out code, console logs, and adherence to style guides.
- **Type Safety**: No `any` types unless absolutely necessary and documented.
- **Testing**: New features must include relevant unit or E2E tests.
- **Agent Collaboration**: If using AI agents, ensure the generated code is reviewed and understood. See [`AGENTS.md`](../AGENTS.md) for details on working with agents.

## Testing & Verification
Before submitting a PR, run the following verification commands:
- **Linting**: `npm run lint`
- **Type Checking**: `npx tsc --noEmit`
- **Unit Tests**: `npm run test` (Vitest)
- **E2E Tests**: `npm run test:e2e` (Playwright) - *Ensure the dev server is running if required by the test config.*

## Onboarding Tasks
New to the project? Start here:
1. **Explore the UI**: Run the app locally and navigate through the Public Landing, User Dashboard, and Admin Dashboard.
2. **Review the Schema**: specific `prisma/schema.prisma` to understand the data model.
3. **Read the Docs**: Start with [`project-overview.md`](./project-overview.md) and [`architecture.md`](./architecture.md).

## Cross-References
- [`testing-strategy.md`](./testing-strategy.md) - Detailed guide on testing practices.
- [`tooling.md`](./tooling.md) - Information about scripts and tools.
