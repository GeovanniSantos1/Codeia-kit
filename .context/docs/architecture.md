---
type: doc
name: architecture
description: System architecture, layers, patterns, and design decisions for the Loan Management System
category: architecture
generated: 2026-01-19
updated: 2026-03-04
status: filled
scaffoldVersion: "2.0.0"
---

# Architecture Notes

## Overview
The Loan Management System is built on the Next.js App Router architecture, leveraging server-side rendering (SSR) and React Server Components (RSC). Business logic is separated from the UI layer in `src/lib`. Data access is managed through Prisma ORM over PostgreSQL. Authentication (Clerk), Payments (Asaas), and AI (OpenRouter) are integrated via external services with secure webhooks and API clients.

## System Architecture
The system follows a modern monolithic architecture within Next.js, deployed as serverless functions and static/dynamic frontend assets.

```
Browser → Next.js Middleware (Auth) → Page/API Route → Service Layer (src/lib) → Database/External API
```

- **Frontend**: React components using Tailwind CSS and Radix UI primitives
- **Backend**: Next.js API Routes (`src/app/api`) as the controller layer
- **Data Layer**: Prisma ORM for type-safe database access
- **Integrations**: Clerk (auth), Asaas (payments), OpenRouter (AI), Vercel Blob / Replit (storage)

## Architectural Layers
- **Routing & Controllers**: `src/app/` — HTTP requests, layouts, page rendering, API route handlers
- **Components**: `src/components/` — ~134 UI elements organized by domain (loans, admin, billing, ai-chat, charts, ui)
- **Business Logic & Services**: `src/lib/` — Core logic for loans, credits, payments, storage, auth
- **Data Access & State**: `src/hooks/` (client state), `src/lib/db.ts` (Prisma), `src/lib/queries/` (data access)
- **Configuration**: `prisma/schema.prisma`, `next.config.ts`, `tailwind.config.ts`

## Detected Design Patterns

| Pattern | Confidence | Locations | Description |
|---------|------------|-----------|-------------|
| **Factory** | High | `src/lib/storage/index.ts` | `getStorageProvider` dynamically selects storage (Vercel Blob vs Replit) |
| **Provider** | High | `src/contexts/` | React Context providers for global state |
| **Facade** | Medium | `src/lib/asaas/client.ts` | `AsaasClient` simplifies the Asaas API |
| **Observer/Webhook** | High | `src/app/api/webhooks/` | Event-driven updates from Clerk and Asaas |
| **Repository-like** | Medium | `src/lib/queries/` | Encapsulated database queries |
| **Calculator** | High | `src/lib/loans/calculations.ts` | Pure functions for interest, installments, penalties |
| **Credit Gate** | High | `src/lib/credits/` | Validate-deduct-refund pattern for credit consumption |

## Entry Points
- **Public Landing**: `src/app/(public)/page.tsx`
- **User Dashboard**: `src/app/(protected)/dashboard/page.tsx`
- **Loan Management**: `src/app/(protected)/loans/page.tsx`
- **Client Management**: `src/app/(protected)/clients/page.tsx`
- **Admin Dashboard**: `src/app/admin/page.tsx`
- **Webhooks**: `src/app/api/webhooks/asaas/route.ts`, `src/app/api/webhooks/clerk/route.ts`

## API Surface

### Loan Domain
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/loans` | GET | List loans with filters (status, overdue, pagination) |
| `/api/loans` | POST | Create loan (auto-generates installments) |
| `/api/loans/[id]` | GET/PUT/DELETE | CRUD operations on individual loan |
| `/api/loans/[id]/installments` | GET | Get installments for a loan |
| `/api/clients` | GET/POST | List/create clients |
| `/api/clients/[id]` | GET/PUT/DELETE | CRUD operations on individual client |
| `/api/transactions` | GET/POST | List/create financial transactions |
| `/api/reports/dashboard` | GET | Dashboard metrics |
| `/api/reports/today` | GET | Installments due today |
| `/api/reports/overdue` | GET | Overdue installments |

### Platform APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/chat` | POST | Stream AI chat (Vercel AI SDK) |
| `/api/ai/image` | POST | Generate images |
| `/api/credits/me` | GET | User credit balance |
| `/api/checkout` | POST | Initiate Asaas payment |
| `/api/subscription/status` | GET | Check subscription |
| `/api/subscription/cancel` | POST | Cancel subscription |
| `/api/webhooks/clerk` | POST | Clerk user sync |
| `/api/webhooks/asaas` | POST | Payment processing |
| `/api/upload` | POST | File upload |
| `/api/public/plans` | GET | Public plan listing |

### Admin APIs (~23 endpoints)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/dashboard` | GET | Admin stats |
| `/api/admin/plans` | GET/POST | Plan management |
| `/api/admin/users` | GET | User management |
| `/api/admin/users/[id]` | GET/PUT | User details/update |
| `/api/admin/users/[id]/credits` | PUT | Adjust credits |
| `/api/admin/settings` | GET/POST | Global settings |

## Internal System Boundaries
- **User vs. Admin**: Strict separation in routing (`src/app/(protected)` vs `src/app/admin`). Admin routes protected by role checks
- **Public vs. App**: Public pages (`src/app/(public)`) separated from authenticated routes
- **Loan Domain**: `src/lib/loans/`, `src/app/api/loans/`, `src/app/api/clients/`, `src/app/api/transactions/`
- **Credit System**: Self-contained domain (`src/lib/credits/`) intersecting with billing and AI
- **Data Ownership**: All loan/client/transaction queries filter by `userId` for data isolation

## External Service Dependencies
| Service | Purpose | Integration |
|---------|---------|-------------|
| **Clerk** | Authentication, user management | Middleware + webhooks |
| **Asaas** | Payments (PIX, Boleto, Credit Card) | HTTP client + webhooks |
| **OpenRouter** | AI model access (100+ LLMs) | Vercel AI SDK provider |
| **Vercel Blob / Replit** | File storage | Factory pattern provider |

## Key Decisions & Trade-offs
- **Prisma over Raw SQL**: Type safety and DX over raw performance
- **Tailwind CSS + Radix UI**: Rapid, accessible UI development
- **Clerk for Auth**: Offloaded auth complexity to specialized provider
- **API Routes over Server Actions**: Clearer separation of concerns, webhook compatibility
- **Simple Interest Model**: Business choice for loan calculations (not compound interest)
- **Credit Gate Pattern**: Validate → Deduct → Execute → Refund-on-failure for AI features

## Directory Statistics
- `src/app`: ~60+ files (Routes & Pages)
- `src/components`: ~134 files (UI Components)
- `src/lib`: ~40 files (Business Logic)
- `src/hooks`: ~15 files (Client State)
- `prisma`: 10+ models, multiple migrations
