# Agents Guide

This file is a navigation hub for agents working in this repository. It avoids duplicating content and points you to the authoritative docs and guides.

## Start Here
- [docs/README.md](docs/README.md) — Central documentation index: architecture, backend/frontend, API, auth, database, loans, workflows
- [agents/README.md](agents/README.md) — Agent guides index with checklists and PR deliverables

## Purpose & Scope
- Use this file to quickly find the right guide or reference.
- All detailed standards live under `docs/` and actionable playbooks under `agents/`.
- Scope: applies to the entire repository.

## Domain Context
This is a **Loan Management System** (Sistema de Gestão de Empréstimos) built as a SaaS platform. Core domain features:
- **Loans**: Create, track, and manage loans with installments and interest calculations
- **Clients**: Manage borrower profiles with contact/bank details (WhatsApp, CPF, PIX, bank account)
- **Installments**: Automatic generation with due dates, payment tracking, daily penalties
- **Transactions**: Financial income (ENTRADA) / expense (SAIDA) tracking linked to clients and loans
- **Alerts**: Today's due and overdue installment monitoring
- **AI Chat**: OpenRouter-powered assistant with streaming and image generation
- **Billing**: Asaas-integrated subscription plans with credit system
- **Admin Panel**: User management, plan management, credit management, analytics (MRR, ARR, churn)

## Key References (authoritative)
- Architecture: [docs/architecture.md](docs/architecture.md)
- Development Workflow: [docs/development-workflow.md](docs/development-workflow.md)
- Glossary & Domain: [docs/glossary.md](docs/glossary.md)
- Security: [docs/security.md](docs/security.md)
- Testing: [docs/testing-strategy.md](docs/testing-strategy.md)
- Tooling: [docs/tooling.md](docs/tooling.md)

## Common Tasks → Guides
- Plan a feature: [agents/architect-specialist.md](agents/architect-specialist.md)
- Build frontend UI: [agents/frontend-specialist.md](agents/frontend-specialist.md)
- Implement API/backend: [agents/feature-developer.md](agents/feature-developer.md)
- Fix bugs: [agents/bug-fixer.md](agents/bug-fixer.md)
- Security review: [agents/security-auditor.md](agents/security-auditor.md)
- Write tests: [agents/test-writer.md](agents/test-writer.md)

## Essentials (quick reminders)
- Database access is server-only. Use Server Components, API routes under `src/app/api/*`, or Server Actions
- Prefer typing feature keys: `FeatureKey = keyof typeof FEATURE_CREDIT_COSTS`. See `src/lib/credits/feature-config.ts`
- Path alias `@/*` → `src/*`
- Loan calculations live in `src/lib/loans/calculations.ts` (interest, installments, penalties, due dates)
- Core domain models: Client, Loan, Installment, Transaction in `prisma/schema.prisma`

## Initial Setup: Environment Variables
**If `.env` file does not exist**, follow these steps:

1. **Create `.env` file**:
   - Copy from `.env.example`: `cp .env.example .env`
   - Configure required variables:
     ```env
     DATABASE_URL="postgresql://user:password@host:port/database"
     ADMIN_EMAILS="admin@yourdomain.com"
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
     CLERK_SECRET_KEY=...
     ASAAS_API_KEY=...
     OPENROUTER_API_KEY=...
     ```

2. **After setting up `.env`**:
   - Run `npm install` to install dependencies
   - Run `npm run db:push` to sync the database schema
   - Run `npm run dev` to start the development server on port 5000

## Project Map (for orientation)
- App Router: `src/app` (public: `(public)`, protected: `(protected)`, admin: `admin`, APIs: `api/*`)
- Components: `src/components` (~134 components organized by domain: loans, admin, ai-chat, billing, charts, ui)
- Libraries & domain: `src/lib` (loans, credits, asaas, storage, auth, queries, logging)
- Hooks: `src/hooks` (use-dashboard, use-credits, use-subscription, use-chat-logic)
- Prisma schema: `prisma/schema.prisma` (10+ models)
- Static assets: `public`

For setup, scripts, and workflows, follow [docs/README.md](docs/README.md).
