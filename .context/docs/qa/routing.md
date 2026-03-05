---
slug: routing
category: architecture
generatedAt: 2026-01-19T17:51:16.539Z
updatedAt: 2026-03-04
---

# How does routing work?

## Routing

### Next.js App Router

Routes are defined by the folder structure in `src/app/`:

### Route Groups
- `(public)/` — Unauthenticated routes (landing, sign-in, sign-up)
- `(protected)/` — Authenticated routes (dashboard, loans, clients, transactions, alerts, ai-chat, billing)
- `admin/` — Admin-only routes (users, plans, credits, settings, analytics)
- `api/` — REST API endpoints
- `subscribe/` — Subscription page

### Protected Pages
| Route | Page |
|-------|------|
| `/dashboard` | Dashboard with metrics, today's due, overdue |
| `/loans` | Loan list with filters and pagination |
| `/loans/new` | Create new loan |
| `/loans/[id]` | Loan details with installment table |
| `/clients` | Client list with search |
| `/clients/new` | Create new client |
| `/clients/[id]` | Client details |
| `/clients/[id]/edit` | Edit client |
| `/transactions` | Transaction history |
| `/alerts/today` | Installments due today |
| `/alerts/overdue` | Overdue installments |
| `/ai-chat` | AI chat interface |
| `/billing` | Billing & subscriptions |

### Admin Pages
| Route | Page |
|-------|------|
| `/admin` | Admin dashboard with stats |
| `/admin/users` | User management |
| `/admin/credits` | Credit management |
| `/admin/settings` | Global settings |
| `/admin/settings/plans` | Plan management |
| `/admin/storage` | File storage viewer |
| `/admin/usage` | Usage analytics |
| `/admin/onboarding` | Developer setup guide |
