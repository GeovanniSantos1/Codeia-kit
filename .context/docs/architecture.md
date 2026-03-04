---
type: doc
name: architecture
description: System architecture, layers, patterns, and design decisions
category: architecture
generated: 2026-01-19
status: filled
scaffoldVersion: "2.0.0"
---

# Architecture Notes

## Architecture Notes
The application is built on the Next.js App Router architecture, leveraging server-side rendering (SSR) and React Server Components (RSC) for optimal performance and SEO. It employs a modular design where business logic is separated from the UI layer, primarily residing in `src/lib`. Data access is managed through Prisma ORM, providing a type-safe layer over the PostgreSQL database. Authentication and Payments are handled via external services (Clerk and Asaas), integrated through secure webhooks and API clients.

## System Architecture Overview
The system follows a modern monolithic architecture within the Next.js framework, deployed as serverless functions (API routes) and static/dynamic frontend assets.
- **Frontend**: React components using Tailwind CSS and Radix UI primitives.
- **Backend**: Next.js API Routes (`src/app/api`) act as the controller layer, handling requests, validation, and delegating to services in `src/lib`.
- **Data Layer**: Prisma ORM acts as the data access layer.
- **Integrations**: 
    - **Clerk**: Authentication and User Management.
    - **Asaas**: Payment Gateway for subscriptions and one-time purchases.
    - **OpenRouter/AI**: External AI model integration.
    - **Storage**: Abstracted storage provider (Vercel Blob, Replit, etc.).

Requests flow from the client (Browser) -> Next.js Middleware (Auth protection) -> Page/API Route -> Service Layer (`src/lib`) -> Database/External API.

## Architectural Layers
- **Routing & Controllers**: `src/app/` - Handles HTTP requests, layouts, and page rendering.
- **Components**: `src/components/` - Reusable UI elements, organized by feature (admin, billing, marketing).
- **Business Logic & Services**: `src/lib/` - Core logic for credits, payments, and integrations.
- **Data Access & State**: `src/hooks/` (Client State) and `src/lib/db.ts` (DB Access).
- **Configuration**: `src/lib/brand-config.ts`, `prisma/schema.prisma`.

> See [`codebase-map.json`](./codebase-map.json) for complete symbol counts and dependency graphs.

## Detected Design Patterns

| Pattern | Confidence | Locations | Description |
|---------|------------|-----------|-------------|
| **Factory** | High | `src/lib/storage/index.ts` | `getStorageProvider` dynamically selects the storage implementation based on environment. |
| **Provider** | High | `src/contexts/` | React Context providers for global state like `AdminDevModeProvider` and `PageMetadata`. |
| **Facade** | Medium | `src/lib/asaas/client.ts` | `AsaasClient` provides a simplified interface to the complex Asaas API. |
| **Observer/Webhook** | High | `src/app/api/webhooks/` | Event-driven architecture handling async updates from Clerk and Asaas. |
| **Repository-like** | Medium | `src/lib/queries/` | Encapsulation of database queries (e.g., `src/lib/queries/plans.ts`). |

## Entry Points
- **Public Landing**: [`src/app/(public)/page.tsx`](../src/app/(public)/page.tsx)
- **App Dashboard**: [`src/app/(protected)/dashboard/page.tsx`](../src/app/(protected)/dashboard/page.tsx)
- **Admin Dashboard**: [`src/app/admin/page.tsx`](../src/app/admin/page.tsx)
- **Webhooks**: [`src/app/api/webhooks/asaas/route.ts`](../src/app/api/webhooks/asaas/route.ts), [`src/app/api/webhooks/clerk/route.ts`](../src/app/api/webhooks/clerk/route.ts)

## Public API
Key exported symbols defining the internal API surface:

| Symbol | Type | Location |
|--------|------|----------|
| `AsaasClient` | Class | `src/lib/asaas/client.ts` |
| `deductCredits` | Function | `src/lib/credits/validate-credits.ts` |
| `useCredits` | Hook | `src/hooks/use-credits.ts` |
| `apiClient` | Function | `src/lib/api-client.ts` |
| `validateUserAuthentication` | Function | `src/lib/auth-utils.ts` |

## Internal System Boundaries
- **Admin vs. User**: Strict separation in routing (`src/app/admin` vs `src/app/(protected)`). Admin routes are protected by role checks (`isAdmin` utility).
- **Marketing vs. App**: Public pages (`src/app/(public)`) are separated from the authenticated application logic.
- **Credit System**: The credits logic (`src/lib/credits`) is a self-contained domain that intersects with billing and AI features.

## External Service Dependencies
- **Clerk**: User authentication, session management.
- **Asaas**: Payment processing (Boleto, PIX, Credit Card), subscriptions.
- **OpenRouter**: AI Model access.
- **Vercel Blob / Replit Object Storage**: File storage.

## Key Decisions & Trade-offs
- **Prisma over Raw SQL**: Chosen for type safety and developer experience, trading off some raw performance for maintainability.
- **Tailwind CSS**: Utility-first styling for rapid UI development and consistency.
- **Clerk for Auth**: Offloading complex auth security and session management to a specialized provider.
- **Server Actions vs API Routes**: The project heavily uses API Routes, likely for clearer separation of concerns and easier integration with external webhooks, though Server Actions might be adopted for form mutations.

## Top Directories Snapshot
- `src/app`: ~50 files (Routes)
- `src/components`: ~100 files (UI)
- `src/lib`: ~40 files (Logic)
- `src/hooks`: ~20 files (State)

## Related Resources
- [`project-overview.md`](./project-overview.md) - High-level project summary.
- [`codebase-map.json`](./codebase-map.json) - Detailed codebase statistics.
