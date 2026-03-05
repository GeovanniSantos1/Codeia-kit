---
slug: middleware
category: architecture
generatedAt: 2026-01-19T17:51:20.946Z
updatedAt: 2026-03-04
---

# How does middleware work?

## Middleware

### Location
`src/middleware.ts`

### Functionality
The middleware uses Clerk's `clerkMiddleware` with route matching to protect authenticated routes.

### Route Protection
- **Public routes** (no auth required): `/`, `/sign-in`, `/sign-up`, `/api/health`, `/api/webhooks/*`, `/api/public/*`
- **Protected routes** (auth required): `/dashboard/*`, `/loans/*`, `/clients/*`, `/transactions/*`, `/alerts/*`, `/ai-chat/*`, `/billing/*`
- **Admin routes** (auth + admin check): `/admin/*` — verifies `ADMIN_EMAILS` or `ADMIN_USER_IDS`

### E2E Testing Bypass
When `E2E_AUTH_BYPASS=1` is set, middleware allows unauthenticated access for Playwright tests. This should never be enabled in production.

### Flow
1. Request arrives at Next.js
2. Clerk middleware checks for valid session token
3. If unauthenticated on protected route → redirect to `/sign-in`
4. If authenticated on admin route → verify admin role
5. If all checks pass → proceed to page/API route
