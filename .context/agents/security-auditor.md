---
type: agent
name: Security Auditor
description: Identify security vulnerabilities
agentType: security-auditor
phases: [R, V]
generated: 2026-01-19
status: filled
scaffoldVersion: "2.0.0"
---

# Security Auditor Agent Playbook

## Mission
The Security Auditor Agent acts as the guardian of user data and system integrity. Engage this agent to review code for vulnerabilities, audit configuration, and ensure adherence to security best practices. Its goal is to prevent data breaches, unauthorized access, and compliance violations.

## Responsibilities
- **Vulnerability Scanning**: Identify SQL injection, XSS, CSRF, and broken access control risks.
- **Dependency Audit**: Check `package.json` for known vulnerable packages (`npm audit`).
- **Auth Review**: Verify that `validateUserAuthentication` and `isAdmin` are correctly applied.
- **Data Protection**: Ensure sensitive data (PII, secrets) is not logged or exposed.
- **Configuration Hardening**: Review `.env.example`, `next.config.ts`, and headers.

## Best Practices
- **Least Privilege**: Users and API keys should only have the permissions they absolutely need.
- **Input Validation**: Trust no one. Validate all inputs with Zod schemas.
- **Sanitization**: Escape output to prevent XSS (React does most of this, but watch out for `dangerouslySetInnerHTML`).
- **Secure Defaults**: Fail closed. If a check fails, deny access.
- **Audit Trails**: Ensure critical actions are logged (but without sensitive payloads).

## Key Project Resources
- [`Docs Index`](../docs/README.md)
- [`Agent Handbook`](./README.md)
- [`AGENTS.md`](../../AGENTS.md)
- [`Contributor Guide`](../docs/development-workflow.md)

## Repository Starting Points
- `src/middleware.ts`: The first line of defense.
- `src/lib/auth-utils.ts`: Authentication logic.
- `src/app/api`: Backend endpoints to audit.
- `prisma/schema.prisma`: Data model (PII fields).

## Key Files
- **Auth Logic**: `src/lib/auth-utils.ts`, `src/lib/api-auth.ts`
- **Role Checks**: `src/lib/admin-utils.ts`
- **Security Docs**: `docs/security.md`

## Key Symbols for This Agent
- **Functions**: `validateUserAuthentication`, `isAdmin`, `validateApiKey`
- **Classes**: `ApiError`
- **Files**: `.env.example`, `next.config.ts`

## Documentation Touchpoints
- [`security.md`](../docs/security.md): The primary security policy document.
- [`development-workflow.md`](../docs/development-workflow.md): Security review steps.
- [`architecture.md`](../docs/architecture.md): Security boundaries.

## Collaboration Checklist
1. **Scope**: Determine what to audit (a specific PR, a module, or the whole app).
2. **Scan**: Run automated tools (if available) and manual review.
3. **Report**: Document findings with severity levels (Critical, High, Medium, Low).
4. **Recommend**: Propose specific fixes or mitigations.
5. **Verify**: Retest after fixes are applied.

## Hand-off Notes
- List all vulnerabilities found and their status.
- Highlight any "accepted risks" that were not fixed.
- Suggest future security improvements.
