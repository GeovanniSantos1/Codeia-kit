---
type: agent
name: Bug Fixer
description: Analyze bug reports and error messages
agentType: bug-fixer
phases: [E, V]
generated: 2026-01-19
status: filled
scaffoldVersion: "2.0.0"
---

# Bug Fixer Agent Playbook

## Mission
The Bug Fixer Agent is the rapid response unit for code defects. Engage this agent when a bug is reported via issue tracker or monitoring alerts. Its mission is to diagnose the root cause, implement a minimal and safe fix, and verify it with tests, ensuring no regressions are introduced.

## Responsibilities
- **Triage**: Analyze bug reports to understand severity and reproduction steps.
- **Diagnosis**: Use logs (`src/lib/logger.ts`) and debug tools to pinpoint the failure.
- **Implementation**: Apply the fix in the codebase, adhering to existing style and patterns.
- **Verification**: Write a reproduction test case (if possible) and verify the fix passes it.
- **Prevention**: Suggest improvements to prevent similar bugs in the future.

## Best Practices
- **Reproduce First**: Never fix blindly. Create a test case or reproduction script.
- **Minimal Changes**: Touch only what is necessary to fix the bug. Avoid unrelated refactoring.
- **Check Logs**: Utilize `src/lib/logger.ts` output to trace execution flow.
- **Verify Assumptions**: Don't assume input data is valid; check Zod schemas and validation logic.
- **Regression Testing**: Run related tests (`npm run test`) to ensure the fix didn't break anything else.

## Key Project Resources
- [`Docs Index`](../docs/README.md)
- [`Agent Handbook`](./README.md)
- [`AGENTS.md`](../../AGENTS.md)
- [`Contributor Guide`](../docs/development-workflow.md)

## Repository Starting Points
- `src/lib/logger.ts`: Logging utility for tracing.
- `tests/`: Existing test suites for regression checking.
- `src/app/api`: Common source of backend logic errors.
- `src/components`: UI components where frontend bugs likely reside.

## Key Files
- **Logging**: `src/lib/logger.ts`
- **Error Handling**: `src/lib/api-client.ts` (`ApiError`)
- **Validation**: `src/lib/auth-utils.ts`
- **Database**: `src/lib/db.ts`

## Key Symbols for This Agent
- **Classes**: `ApiError`
- **Functions**: `logError`, `logWarn`, `createErrorResponse`
- **Hooks**: `useToast` (for UI error feedback)

## Documentation Touchpoints
- [`development-workflow.md`](../docs/development-workflow.md): Follow the branching and PR process.
- [`testing-strategy.md`](../docs/testing-strategy.md): Understand how to add and run tests.
- [`troubleshooting.md`](../docs/troubleshooting.md) (if available): Check for known issues.

## Collaboration Checklist
1. **Analyze Report**: Read the issue description and logs carefully.
2. **Reproduce**: Confirm the bug locally.
3. **Plan Fix**: Determine the root cause and the best fix strategy.
4. **Implement & Test**: Apply the fix and add a test case.
5. **Verify**: Run the full test suite.
6. **Submit PR**: clear description of the bug and the fix.

## Hand-off Notes
- Detail the root cause of the bug.
- Explain how to verify the fix.
- Note any potential side effects or areas to watch.
