---
slug: project-structure
category: architecture
generatedAt: 2026-01-19T17:51:12.175Z
updatedAt: 2026-03-04
---

# How is the codebase organized?

## Project Structure

```
prisma/                    # Database schema, migrations, generated client
  schema.prisma            # 10+ models: User, Client, Loan, Installment, Transaction, Plan, etc.
  migrations/              # Database migration files
src/
  app/                     # Next.js App Router
    (public)/              # Public routes (landing, sign-in, sign-up)
    (protected)/           # Auth-protected routes
      dashboard/           # Dashboard with metrics and alerts
      loans/               # Loan management (list, create, detail)
      clients/             # Client management (list, create, edit, detail)
      transactions/        # Transaction history
      alerts/              # Today's due & overdue alerts
      ai-chat/             # AI chat interface
      billing/             # Billing & subscriptions
      messages/            # WhatsApp messages
    admin/                 # Admin panel (users, plans, credits, settings, analytics)
    api/                   # REST API routes (~48 route files)
      loans/               # Loan CRUD endpoints
      clients/             # Client CRUD endpoints
      transactions/        # Transaction endpoints
      reports/             # Dashboard, today, overdue reports
      ai/                  # AI chat and image endpoints
      credits/             # Credit balance endpoints
      checkout/            # Payment checkout
      admin/               # Admin management APIs
      webhooks/            # Clerk & Asaas webhooks
  components/              # ~134 React components
    ui/                    # Base UI primitives (Button, Input, Card, Dialog, etc.)
    loans/                 # Loan-specific components (LoanForm, InstallmentTable, etc.)
    admin/                 # Admin panel components
    ai-chat/               # Chat UI components
    billing/               # Billing components
    charts/                # Analytics charts (MRR, ARR, Churn)
    app/                   # Layout components (Sidebar, Header, Footer)
  lib/                     # Business logic & utilities
    loans/                 # Loan calculations (interest, installments, penalties)
    credits/               # Credit system (validate, deduct, refund, track)
    asaas/                 # Asaas payment client
    storage/               # File storage (Vercel Blob, Replit)
    queries/               # Database query layer
    auth-utils.ts          # Authentication helpers
    db.ts                  # Prisma client singleton
    api-client.ts          # HTTP client for frontend
  hooks/                   # Custom React hooks
  contexts/                # React context providers
  middleware.ts            # Clerk auth middleware
tests/                     # Test suites
  unit/                    # Vitest unit tests
  e2e/                     # Playwright E2E tests
public/                    # Static assets
```
