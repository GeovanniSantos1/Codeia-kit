# GG Empréstimos — Gestão de Empréstimos

## Overview
A full-stack SaaS loan management app built with Next.js 16, Prisma, Clerk authentication, Asaas payments, and shadcn/ui. Replaces manual Excel spreadsheets for personal loan management with automated interest/penalty calculations, installment tracking, WhatsApp messaging, and real-time dashboards.

## Architecture
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Auth**: Clerk (`@clerk/nextjs`)
- **Payments**: Asaas (Brazilian payment provider for subscriptions)
- **Database**: PostgreSQL via Prisma ORM (Replit-hosted)
- **UI**: Tailwind CSS v4, Radix UI, shadcn/ui components
- **State**: TanStack Query for client-side data fetching

## Key Directories
- `src/app/(public)/` — Landing page, sign-in, sign-up
- `src/app/(protected)/` — Auth-protected pages:
  - `/dashboard` — KPI metrics, due today, overdue lists
  - `/clients` — Client CRUD (list, create, detail, edit)
  - `/loans` — Loan CRUD with installment management
  - `/transactions` — Cash flow entries/exits
  - `/messages` — WhatsApp message composer
  - `/alerts/today` — Installments due today
  - `/alerts/overdue` — Overdue installments
  - `/billing` — Subscription management
- `src/app/api/` — API route handlers:
  - `/api/clients` — Client CRUD
  - `/api/loans` — Loan CRUD + installment management
  - `/api/transactions` — Cash flow CRUD
  - `/api/reports/dashboard` — Dashboard metrics
  - `/api/reports/today` — Due today installments
  - `/api/reports/overdue` — Overdue installments
  - `/api/messages/whatsapp` — WhatsApp deep-link generator
  - `/api/webhooks/asaas` — Asaas payment webhooks
  - `/api/webhooks/clerk` — Clerk user sync webhooks
- `src/components/loans/` — LoanManager-specific components
- `src/lib/loans/` — Business logic (calculations, queries)
- `prisma/` — Schema and migrations

## Database Models (LoanManager-specific)
- **Client** — Customer with personal, banking, and PIX data
- **Loan** — Loan record with principal, interest rate, interval, penalty
- **Installment** — Individual installment with due date, status, penalty tracking
- **Transaction** — Cash flow entry (ENTRADA/SAIDA)
- Enums: `LoanInterval`, `LoanStatus`, `InstallmentStatus`, `TransactionType`

## Business Logic
- Located in `src/lib/loans/calculations.ts`
- Interest: `principal * interestRate / 100`
- Total debt: `principal + interest`
- Installment amount: `totalDebt / installmentsCount`
- Penalty: `installmentAmount * penaltyPerDay/100 * daysOverdue`
- Due dates generated based on interval (daily/weekly/biweekly/monthly)

## Running the App
- **Dev**: `npm run dev` (prisma generate + Next.js on port 5000)
- **Build**: `npm run build`
- **Start**: `npm run start` (port 5000, 0.0.0.0)

## Required Secrets
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk publishable key
- `CLERK_SECRET_KEY` — Clerk secret key
- `CLERK_WEBHOOK_SECRET` — Clerk webhook signing secret
- `ASAAS_API_KEY` — Asaas payment API key
- `ASAAS_WEBHOOK_SECRET` — Asaas webhook verification token
- `OPENROUTER_API_KEY` — OpenRouter AI API key
- `DATABASE_URL` — PostgreSQL (auto-managed by Replit)

## Database Commands
- Apply migrations: `npx prisma migrate deploy`
- Push schema: `npm run db:push`
- Prisma Studio: `npm run db:studio`

## Replit Configuration
- Port: **5000** (required by Replit webview)
- Host: **0.0.0.0**
- Node.js 22 module
- `allowedDevOrigins` configured in `next.config.ts`
