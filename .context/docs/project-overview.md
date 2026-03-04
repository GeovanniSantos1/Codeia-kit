---
type: doc
name: project-overview
description: High-level overview of the project, its purpose, and key components
category: overview
generated: 2026-01-19
status: filled
scaffoldVersion: "2.0.0"
---

# Project Overview

## Project Overview
This project is a comprehensive Next.js starter kit integrated with Asaas for payments, designed to jumpstart SaaS application development. It features a robust architecture including authentication (Clerk), database management (Prisma), a credits system, AI capabilities (OpenRouter), and a full-featured admin dashboard. It solves the boilerplate problem for Brazilian SaaS developers by providing a pre-configured, production-ready environment with essential billing and user management features.

## Codebase Reference
> **Detailed Analysis**: For complete symbol counts, architecture layers, and dependency graphs, see [`codebase-map.json`](./codebase-map.json).

## Quick Facts
- **Root**: `C:\Users\danon\Documents\Works\starter-kit-with-asaas-mainzip`
- **Languages**: TypeScript (extensive usage), JavaScript, CSS/PostCSS
- **Entry**: `src/app/page.tsx` (Public Landing), `src/app/(protected)/dashboard/page.tsx` (User Dashboard)
- **Full analysis**: [`codebase-map.json`](./codebase-map.json)

## Entry Points
- **Public Landing Page**: [`src/app/(public)/page.tsx`](../src/app/(public)/page.tsx) - The main marketing and entry point for unauthenticated users.
- **User Dashboard**: [`src/app/(protected)/dashboard/page.tsx`](../src/app/(protected)/dashboard/page.tsx) - The central hub for authenticated users.
- **Admin Dashboard**: [`src/app/admin/page.tsx`](../src/app/admin/page.tsx) - Administrative interface for managing users, plans, and credits.
- **API Routes**: Located in [`src/app/api`](../src/app/api), handling webhooks, subscriptions, and AI interactions.

## Key Exports
Key domain models and utilities are exported throughout the application. Refer to `codebase-map.json` for the complete list. Notable exports include:
- **Authentication**: `validateUserAuthentication`, `apiClient`
- **Billing & Credits**: `deductCredits`, `useCredits`, `AsaasClient`
- **AI Integration**: `useGenerateImage`, `useChatLogic`
- **Admin Utilities**: `useAdminSettings`, `useAdminPlans`

## File Structure & Code Organization
- `src/app/` — Next.js App Router structure, defining routes and layouts.
- `src/components/` — Reusable UI components, organized by domain (e.g., `admin`, `billing`, `ui`).
- `src/lib/` — core business logic, utility functions, and third-party client wrappers (Asaas, Clerk).
- `src/hooks/` — Custom React hooks for state management and API interaction.
- `src/contexts/` — React Context providers for global state (e.g., `AdminDevModeProvider`).
- `prisma/` — Database schema and migration files.
- `tests/` — End-to-end and unit tests.
- `public/` — Static assets.

## Technology Stack Summary
The project leverages a modern, type-safe stack:
- **Runtime**: Node.js
- **Framework**: Next.js (React)
- **Language**: TypeScript
- **Database**: PostgreSQL (managed via Prisma ORM)
- **Authentication**: Clerk
- **Styling**: Tailwind CSS
- **Testing**: Playwright (E2E), Vitest (Unit)
- **Package Manager**: NPM

## Core Framework Stack
- **Frontend**: Next.js App Router for server-side rendering and static generation.
- **Backend**: Next.js API Routes for serverless backend logic.
- **Database**: Prisma ORM for type-safe database access.
- **Payments**: Asaas integration for Brazilian payment processing.

## UI & Interaction Libraries
- **Component Library**: Custom components built with Tailwind CSS and Radix UI primitives (implied by `components/ui` structure).
- **Icons**: Lucide React (commonly used with shadcn/ui).
- **Charts**: Recharts (inferred from `components/charts`).
- **Forms**: React Hook Form (likely usage given the complexity).

## Development Tools Overview
- **Linting**: ESLint
- **Formatting**: Prettier
- **Testing**: Playwright for browser testing, Vitest for unit logic.

## Getting Started Checklist
1. **Install dependencies**: Run `npm install` to setup the project.
2. **Environment Setup**: Copy `.env.example` to `.env` and populate required keys (Database, Clerk, Asaas).
3. **Database**: Run `npx prisma migrate dev` to setup the database schema.
4. **Start Development Server**: Run `npm run dev` to launch the application at `http://localhost:3000`.
5. **Verify**: Log in (or sign up) to access the dashboard and ensure database connectivity.
6. **Review Workflow**: Check [`development-workflow.md`](./development-workflow.md) for contribution guidelines.

## Next Steps
- Review the [`architecture.md`](./architecture.md) for a deeper dive into the system design.
- Explore [`development-workflow.md`](./development-workflow.md) to understand how to contribute.
- Check [`tooling.md`](./tooling.md) for details on the available scripts and tools.
