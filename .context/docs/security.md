---
type: doc
name: security
description: Security policies, authentication, secrets management, and compliance for the Loan Management System
category: security
generated: 2026-01-19
updated: 2026-03-04
status: filled
scaffoldVersion: "2.0.0"
---

# Security & Compliance Notes

## Overview
This project handles sensitive financial data (loans, transactions, client PII). We adhere to the principle of least privilege and "fail secure" defaults. Compliance with Brazilian data protection laws (LGPD) is a key consideration.

## Authentication & Authorization
- **Authentication**: Managed by **Clerk**. No passwords stored locally. JWTs for API authentication
- **Authorization**:
  - **RBAC**: Admin role verified via `ADMIN_EMAILS` or `ADMIN_USER_IDS` environment variables
  - **Middleware**: `src/middleware.ts` protects routes (`/dashboard/*`, `/loans/*`, `/clients/*`, `/admin/*`)
  - **API**: All API routes validate session using `auth()` from `@clerk/nextjs/server`
  - **Data Isolation**: Every loan/client/transaction query filters by `userId` — users can only access their own data
  - **Webhooks**: Validated via signature verification (Clerk uses Svix, Asaas uses custom token)
  - **E2E Bypass**: `E2E_AUTH_BYPASS=1` for testing only (never in production)

## Secrets & Sensitive Data
- **Storage**: Environment variables (`.env`) for all API keys and secrets. **NEVER** commit `.env` to git
- **Required Secrets**:
  - `DATABASE_URL` — PostgreSQL connection
  - `CLERK_SECRET_KEY` — Clerk backend key
  - `ASAAS_API_KEY` — Payment processing
  - `ASAAS_WEBHOOK_SECRET` — Webhook verification
  - `CLERK_WEBHOOK_SECRET` — Webhook verification
  - `OPENROUTER_API_KEY` — AI integration
  - `BLOB_READ_WRITE_TOKEN` — File storage
- **Classification**:
  - **Public**: Plan names, feature lists, pricing
  - **Internal**: User IDs, credit balances, loan status
  - **Confidential**: Client emails, CPF, WhatsApp, bank details, transaction amounts
  - **Restricted**: API keys, webhook secrets, database credentials

## Data Protection (Financial)
- **Client PII**: CPF, WhatsApp, bank account details stored in database. Access restricted by `userId`
- **Financial Data**: Loan amounts, interest rates, transaction records — all scoped to authenticated user
- **No Card Storage**: Payment card data handled entirely by Asaas (PCI-DSS compliant)
- **Soft Deletes**: `StorageObject` uses `deletedAt` for file management

## Compliance & Policies
- **LGPD (Brazil)**: Users have the right to request data deletion. Client data can be removed via the UI
- **PCI-DSS**: No credit card numbers touch our servers. All card entry via Asaas secure pages
- **Audit Trail**: `SubscriptionEvent` model logs all billing events with metadata
- **Credit Audit**: `UsageHistory` model tracks all AI credit consumption

## Incident Response
- **Contact**: Tech Lead (or designate)
- **Escalation**:
  1. **Detection**: Alert from monitoring or user report
  2. **Triage**: Assess impact (data leak, service down, financial data exposed)
  3. **Containment**: Rotate API keys, rollback deploy
  4. **Resolution**: Fix the vulnerability
  5. **Post-Mortem**: Document root cause and preventative measures
