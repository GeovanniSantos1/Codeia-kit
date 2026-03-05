---
slug: api-endpoints
category: features
generatedAt: 2026-01-19T17:51:20.947Z
updatedAt: 2026-03-04
relevantFiles:
  - src/app/api/loans/route.ts
  - src/app/api/clients/route.ts
  - src/app/api/transactions/route.ts
  - src/app/api/reports/dashboard/route.ts
  - src/lib/api-client.ts
---

# What API endpoints are available?

## API Endpoints

### Loan Management
- `GET /api/loans` — List loans with filters (status, overdue, pagination)
- `POST /api/loans` — Create loan (auto-generates installments)
- `GET /api/loans/[id]` — Get loan details with installments
- `PUT /api/loans/[id]` — Update loan
- `DELETE /api/loans/[id]` — Delete loan
- `GET /api/loans/[id]/installments` — Get installments for a loan

### Client Management
- `GET /api/clients` — List clients with search and pagination
- `POST /api/clients` — Create client
- `GET /api/clients/[id]` — Get client details
- `PUT /api/clients/[id]` — Update client
- `DELETE /api/clients/[id]` — Delete client

### Transactions
- `GET /api/transactions` — List transactions with filters (month, year, type, pagination)
- `POST /api/transactions` — Create transaction

### Reports
- `GET /api/reports/dashboard` — Dashboard metrics (total principal, active loans, overdue, interest)
- `GET /api/reports/today` — Installments due today
- `GET /api/reports/overdue` — Overdue installments

### AI
- `POST /api/ai/chat` — Stream text chat (Vercel AI SDK)
- `POST /api/ai/image` — Generate images
- `GET /api/ai/openrouter/models` — List available AI models

### Credits & Billing
- `GET /api/credits/me` — Get user credit balance
- `GET /api/credits/settings` — Get feature cost configuration
- `POST /api/checkout` — Initiate Asaas payment
- `GET /api/subscription/status` — Check subscription status
- `POST /api/subscription/cancel` — Cancel subscription
- `GET /api/public/plans` — List public plans

### Webhooks
- `POST /api/webhooks/clerk` — Clerk user sync (create/update/delete)
- `POST /api/webhooks/asaas` — Asaas payment processing

### Admin (~23 endpoints)
- `GET/POST /api/admin/plans` — Plan management
- `GET /api/admin/users` — User listing
- `PUT /api/admin/users/[id]/credits` — Credit adjustment
- `GET/POST /api/admin/settings` — Global settings
- `POST /api/admin/users/sync` — Sync users from Clerk

### Utilities
- `POST /api/upload` — File upload (Vercel Blob or Replit)
- `POST /api/messages/whatsapp` — WhatsApp integration

## API Client
The frontend uses `src/lib/api-client.ts` (`apiClient`) for all HTTP requests, with `ApiError` class for error handling.
