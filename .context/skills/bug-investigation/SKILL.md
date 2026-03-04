---
name: Bug Investigation
description: Systematic bug investigation and root cause analysis
---

# Bug Investigation Skill

## Debugging Workflow
1. **Reproduce**: Create a minimal reproduction case. If it's a UI bug, identify the browser/viewport.
2. **Logs**: Check server logs (Vercel) and client console. Look for `ApiError` or unhandled rejections.
3. **Trace**: Follow the data flow.
   - UI -> Hook -> API Route -> Controller -> Service -> Database.
4. **Isolate**: Determine if it's Frontend (React state/render), Backend (API logic), or Data (Prisma/DB).

## Common Patterns
- **Auth Sync**: Clerk user not synced to local DB (Webhooks failed? Check `src/app/api/webhooks`).
- **Credits**: "Insufficient credits" error when user thinks they have enough (Race condition? Stale state?).
- **Payment**: Asaas webhook not processed (Signature verification failed? Idempotency check?).
- **Hydration**: React hydration mismatch (Date formatting? Random values on server vs client?).

## Tools
- **Logger**: Use `src/lib/logger.ts` to add tracing logs.
- **Prisma Studio**: Inspect DB state directly.
- **Network Tab**: Inspect API payloads and response headers.

## Verification
- Create a test case that fails with the bug and passes with the fix.
- Verify no regressions in related features (e.g., fixing "buy credits" shouldn't break "subscription").