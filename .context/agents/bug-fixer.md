---
type: agent
name: Bug Fixer
description: Analyze bug reports and fix issues in the Loan Management System
agentType: bug-fixer
phases: [E, V]
generated: 2026-01-19
updated: 2026-03-04
status: filled
scaffoldVersion: "2.0.0"
---

# Bug Fixer Agent Playbook

## Mission
The Bug Fixer Agent is the rapid response unit for code defects. Engage this agent when a bug is reported. Its mission is to diagnose root cause, implement a minimal safe fix, and verify with tests.

## Responsibilities
- **Triage**: Analyze bug reports to understand severity and reproduction steps
- **Diagnosis**: Use logs and debug tools to pinpoint failures
- **Implementation**: Apply the fix adhering to existing patterns
- **Verification**: Write reproduction test cases and verify fix
- **Prevention**: Suggest improvements to prevent similar bugs

## Best Practices
- **Reproduce First**: Never fix blindly. Create a test case
- **Minimal Changes**: Only touch what is necessary
- **Check Financial Logic**: Loan calculations, installment amounts, and penalty math are critical — verify carefully
- **Verify Data Isolation**: Ensure bugs aren't caused by missing `userId` filters
- **Regression Testing**: Run related tests after fixing

## Common Bug Patterns
- **Auth Sync**: Clerk user not synced to local DB (webhook failed? Check `src/app/api/webhooks/clerk`)
- **Loan Calculations**: Wrong installment amounts (check `src/lib/loans/calculations.ts`)
- **Overdue Detection**: Installments not showing as overdue (date comparison issues?)
- **Credits**: "Insufficient credits" when user has enough (race condition? stale state?)
- **Payment**: Asaas webhook not processed (signature verification? idempotency?)
- **Hydration**: React mismatch (date formatting on server vs client?)
- **Data Isolation**: User seeing another user's data (missing `userId` filter)

## Key Files
- **Loan Logic**: `src/lib/loans/calculations.ts`
- **Error Handling**: `src/lib/api-client.ts` (`ApiError`)
- **Auth**: `src/lib/auth-utils.ts`
- **Database**: `src/lib/db.ts`
- **Credit System**: `src/lib/credits/`
- **Logging**: `src/lib/logging/`

## Collaboration Checklist
1. **Analyze Report**: Read the issue and logs carefully
2. **Reproduce**: Confirm the bug locally
3. **Plan Fix**: Determine root cause and fix strategy
4. **Implement & Test**: Apply fix and add test case
5. **Verify**: Run the full test suite
