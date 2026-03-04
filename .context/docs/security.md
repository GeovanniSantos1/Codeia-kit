---
type: doc
name: security
description: Security policies, authentication, secrets management, and compliance requirements
category: security
generated: 2026-01-19
status: filled
scaffoldVersion: "2.0.0"
---

# Security & Compliance Notes

## Security & Compliance Notes
This project prioritizes the security of user data and the integrity of financial transactions. We adhere to the principle of least privilege and "fail secure" defaults. Compliance with Brazilian data protection laws (LGPD) is a key consideration.

## Authentication & Authorization
- **Authentication**: Managed by **Clerk**. We do not store passwords. We use JWTs for API authentication.
- **Authorization**:
  - **RBAC**: Role-Based Access Control. The `admin` role is stored in Clerk's `publicMetadata`.
  - **Middleware**: `src/middleware.ts` protects routes starting with `/dashboard` and `/admin`.
  - **API**: Internal API routes validate the session using `auth()` helper.
  - **Webhooks**: Validated via signature verification (Clerk and Asaas).

## Secrets & Sensitive Data
- **Storage**: Environment variables (`.env`) are used for API keys and secrets. **NEVER** commit `.env` to git.
- **Encryption**: Secrets are encrypted at rest by the hosting provider (Vercel).
- **Classification**:
  - **Public**: Plan names, feature lists.
  - **Internal**: User IDs, credit balances.
  - **Confidential**: Emails, CPF (Tax ID), Transaction IDs.
  - **Restricted**: API Keys, Webhook Secrets (only accessible to backend).

## Compliance & Policies
- **LGPD (Brazil)**: Users have the right to request data deletion. We support this via the "Delete Account" flow.
- **PCI-DSS**: We do **not** touch credit card numbers. All card entry happens via Asaas's secure iframes or redirect pages.
- **Audit Logs**: Critical actions (credit adjustment, plan changes) are logged to the database or logging service.

## Incident Response
- **Contact**: Tech Lead (or designate).
- **Escalation**:
  1. **Detection**: Alert from Sentry/Vercel or User Report.
  2. **Triage**: Assess impact (Data Leak? Service Down?).
  3. **Containment**: Rotate keys, rollback deploy, or enable "Maintenance Mode".
  4. **Resolution**: Fix the vulnerability.
  5. **Post-Mortem**: Document root cause and preventative measures.
