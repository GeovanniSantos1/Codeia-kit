---
name: Security Audit
description: Security review checklist for code and infrastructure
---

# Security Audit Skill

## Checklist
- [ ] **Authentication**: Are all private routes protected by `auth()`?
- [ ] **Authorization**: Do Admin routes check `isAdmin(userId)`?
- [ ] **Data Access**: Does the user have ownership of the resource they are accessing? (e.g., `where: { userId }`).
- [ ] **Validation**: Is *all* input validated with Zod? (Params, Body, Query).
- [ ] **Secrets**: Are keys (API keys, Tokens) excluded from client bundles?

## Common Vulnerabilities
- **IDOR (Insecure Direct Object Reference)**: Fetching data by ID without checking if the requester owns it.
- **CSRF**: Next.js handles this for Server Actions/API routes, but ensure custom forms use proper handlers.
- **XSS**: Watch out for `dangerouslySetInnerHTML`.

## Auth Patterns
- Use `src/lib/auth-utils.ts` -> `validateUserAuthentication()`.
- For API keys (external access), use `validateApiKey()`.

## Data Validation
- Schema: `z.object({ email: z.string().email() })`.
- Parse: `schema.parse(body)`.
- sanitize: Trim strings, limit lengths.