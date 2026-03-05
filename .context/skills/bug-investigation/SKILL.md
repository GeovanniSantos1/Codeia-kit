---
name: bug-investigation
description: Systematic bug investigation for loan management, billing, and auth issues
---

# Bug Investigation Skill

## Debugging Workflow
1. **Reproduce**: Create a minimal reproduction case. If UI bug, identify browser/viewport
2. **Logs**: Check server logs and client console. Look for `ApiError` or unhandled rejections
3. **Trace**: Follow the data flow: UI -> Hook -> API Route -> Service -> Database
4. **Isolate**: Frontend (React state/render), Backend (API logic), or Data (Prisma/DB)

## Common Patterns

### Loan Domain
- **Wrong installment amounts**: Check `src/lib/loans/calculations.ts` — interest formula, rounding
- **Missing overdue alerts**: Date comparison issues (timezone?), installment status not updated
- **Installment generation**: Verify `generateInstallments()` with different intervals (daily/weekly/biweekly/monthly)
- **Penalty calculation**: `penaltyPerDay * daysOverdue` — check date diff logic

### Auth & Users
- **Auth Sync**: Clerk user not synced to local DB (webhook failed? Check `src/app/api/webhooks/clerk`)
- **Data Isolation**: User seeing another user's data (missing `userId` filter in query)
- **Admin Access**: Admin check failing (verify `ADMIN_EMAILS` or `ADMIN_USER_IDS` env vars)

### Billing & Credits
- **Credits**: "Insufficient credits" when user has enough (race condition? stale React Query cache?)
- **Payment**: Asaas webhook not processed (signature verification failed? idempotency?)
- **Subscription**: Plan not activating (webhook event type mismatch?)

### Frontend
- **Hydration**: React mismatch (date formatting on server vs client? `new Date()` differences?)
- **Form validation**: Zod schema mismatch between frontend and API
- **Stale data**: React Query cache not invalidated after mutation

## Tools
- **API Logging**: `src/lib/logging/` for request/response tracing
- **Prisma Studio**: `npm run db:studio` — inspect DB records directly
- **Network Tab**: Inspect API payloads and response headers
- **React Query DevTools**: Check cache state

## Verification
- Create a test case that fails with the bug and passes with the fix
- Verify no regressions in related features (e.g., fixing loan calculation shouldn't break installment display)
