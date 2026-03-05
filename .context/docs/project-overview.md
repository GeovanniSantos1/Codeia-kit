---
type: doc
name: project-overview
description: High-level overview of the Loan Management System
category: overview
generated: 2026-01-19
updated: 2026-03-04
status: filled
scaffoldVersion: "2.0.0"
---

# Project Overview

## Summary
This project is a **Loan Management System** (Sistema de Gestão de Empréstimos) built as a SaaS platform on Next.js. It enables users to manage loans, clients, installments, and financial transactions with features like automatic installment generation, overdue tracking, penalty calculations, and AI-powered analysis. The platform includes Asaas payment integration for subscriptions, Clerk authentication, a credit-based AI chat system, and a comprehensive admin dashboard.

## Quick Facts
- **Languages**: TypeScript (primary), CSS/PostCSS
- **Framework**: Next.js 16.1.6 (App Router)
- **Runtime**: Node.js with React 19.2.4
- **Database**: PostgreSQL (managed via Prisma ORM 6.16.3)
- **Authentication**: Clerk
- **Payments**: Asaas (Brazilian payment gateway)
- **AI**: OpenRouter via Vercel AI SDK
- **Dev Server Port**: 5000

## Entry Points
- **Public Landing Page**: `src/app/(public)/page.tsx` — Marketing page, redirects to dashboard if logged in
- **User Dashboard**: `src/app/(protected)/dashboard/page.tsx` — Loan metrics, today's due, overdue alerts
- **Loan Management**: `src/app/(protected)/loans/page.tsx` — Create, list, and manage loans
- **Client Management**: `src/app/(protected)/clients/page.tsx` — Manage borrower profiles
- **Admin Dashboard**: `src/app/admin/page.tsx` — User management, plans, credits, analytics
- **API Routes**: `src/app/api/` — REST endpoints for all features

## Core Features

### Loan Management
- Create loans with principal, interest rate, installment count, and interval (daily/weekly/biweekly/monthly)
- Automatic installment generation with calculated due dates and amounts
- Simple interest calculation: `principal * (interestRate / 100)`
- Per-day penalty system for overdue installments
- Loan status tracking: ACTIVE, PAID_OFF, CANCELLED
- Installment status: PENDING, PAID, OVERDUE

### Client Management
- Borrower profiles with contact details (WhatsApp, CPF)
- Banking information (PIX, bank, agency, account)
- Additional fields: mother's name, address, reserve, credit line, notes
- Client-loan-transaction associations

### Financial Transactions
- Income (ENTRADA) and expense (SAIDA) tracking
- Monthly/yearly filtering and pagination
- Linked to clients and loans

### Alerts & Reports
- Dashboard metrics: total principal, active loans, overdue count, total interest
- Today's due installments
- Overdue installments monitoring
- Admin charts: MRR, ARR, churn visualization

### AI Chat System
- OpenRouter integration supporting 100+ LLMs
- Real-time streaming via Vercel AI SDK
- Dynamic model selection
- File attachments (upload to Vercel Blob)
- Credit-based: 1 credit/message, 5 credits/image

### Billing & Subscriptions
- Asaas payment gateway (PIX, Boleto, Credit Card)
- Monthly & yearly subscription plans
- Webhook-driven credit allocation
- CPF/CNPJ validation for checkout
- Scheduled cancellation with grace period

### Admin Panel
- User management: list, search, activate/deactivate, adjust credits
- Plan management: create, edit, delete subscription plans
- Settings: feature costs, pricing configuration
- Analytics: MRR, ARR, churn, usage metrics
- Storage management, user sync, invitations

## File Structure & Code Organization
- `src/app/` — Next.js App Router (pages, layouts, API routes)
- `src/components/` — ~134 reusable UI components by domain (loans, admin, billing, ai-chat, charts, ui)
- `src/lib/` — Core business logic (loans/calculations, credits, asaas, storage, auth, queries)
- `src/hooks/` — Custom React hooks (use-dashboard, use-credits, use-subscription, use-chat-logic)
- `src/contexts/` — React Context providers
- `prisma/` — Database schema and migrations
- `tests/` — Unit and E2E tests
- `public/` — Static assets

## Technology Stack
| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16.1.6 (App Router) |
| **UI** | React 19.2.4, Tailwind CSS 4.1.13, Radix UI |
| **Forms** | React Hook Form 7.60.0, Zod 4.1.8 |
| **Data Fetching** | TanStack React Query 5.82.0 |
| **AI** | Vercel AI SDK 5.0.55, OpenRouter Provider |
| **Database** | PostgreSQL, Prisma 6.16.3 |
| **Auth** | Clerk (@clerk/nextjs 6.37.0) |
| **Payments** | Asaas API (HTTP client) |
| **Storage** | Vercel Blob 2.0.0, Replit Object Storage |
| **Charts** | Recharts 2.15.4 |
| **Icons** | Lucide React 0.525.0 |
| **Animations** | Framer Motion 12.23.12 |
| **Markdown** | react-markdown, remark-gfm, rehype-highlight |
| **Notifications** | Sonner 2.0.6 |
| **Testing** | Vitest 4.0.7, Playwright 1.55.0 |
| **Language** | TypeScript 5 |

## Getting Started
1. `cp .env.example .env` — Configure environment variables
2. `npm install` — Install dependencies
3. `npm run db:push` — Sync database schema
4. `npm run dev` — Start dev server at port 5000
5. Sign up via Clerk, access the dashboard, and start managing loans

## Next Steps
- Review [`architecture.md`](./architecture.md) for system design details
- Explore [`development-workflow.md`](./development-workflow.md) for contribution guidelines
- Check [`glossary.md`](./glossary.md) for domain terminology
