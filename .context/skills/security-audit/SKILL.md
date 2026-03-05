---
name: security-audit
description: Security review for data isolation, auth, and financial data protection
---

# Security Audit Skill

## Checklist
- [ ] **Authentication**: Are all private routes protected by `auth()`?
- [ ] **Authorization**: Do admin routes check admin status?
- [ ] **Data Isolation**: Does every loan/client/transaction query filter by `userId`?
- [ ] **Input Validation**: Is all input validated with Zod? (params, body, query)
- [ ] **Secrets**: Are API keys excluded from client bundles?
- [ ] **Financial Data**: Are loan amounts, interest rates, and client PII protected?

## Common Vulnerabilities
- **IDOR**: Fetching loan/client by ID without checking if requester is the owner
- **Data Leakage**: Client CPF, WhatsApp, or bank details exposed to wrong user
- **CSRF**: Ensure proper form handling for financial operations
- **XSS**: Watch for `dangerouslySetInnerHTML` in chat messages
- **Credit Manipulation**: Ensure validate-deduct-refund pattern is atomic

## Auth Patterns
- Use `src/lib/auth-utils.ts` -> `validateUserAuthentication()`
- Admin check via `ADMIN_EMAILS` / `ADMIN_USER_IDS` environment variables
- Webhook verification: Clerk (Svix signature), Asaas (token)

## Data Validation
```typescript
// Example: Loan creation validation
const loanSchema = z.object({
  clientId: z.string(),
  principal: z.number().positive(),
  interestRate: z.number().min(0),
  installmentsCount: z.number().int().positive(),
  interval: z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY"]),
});
```

## Financial Data Protection
- Client PII (CPF, bank details) — never expose in logs or error messages
- Loan amounts — always scoped by authenticated user
- Transaction records — filter by `userId` in all queries
- Credit operations — use validate-deduct-refund atomic pattern
