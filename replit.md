# Next.js SaaS Template — Replit

## Overview
A full-stack SaaS starter built with Next.js 16, Prisma, Clerk authentication, Asaas payments, and OpenRouter AI. Migrated from Vercel to Replit.

## Architecture
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Auth**: Clerk (`@clerk/nextjs`)
- **Payments**: Asaas (Brazilian payment provider)
- **AI**: OpenRouter via `@openrouter/ai-sdk-provider`
- **Database**: PostgreSQL via Prisma ORM (Replit-hosted)
- **UI**: Tailwind CSS v4, Radix UI, shadcn/ui components
- **File Storage**: Replit Object Storage (`@replit/object-storage`) or Vercel Blob

## Key Directories
- `src/app/` — Next.js App Router pages and API routes
- `src/app/(public)/` — Public pages (landing, sign-in, sign-up)
- `src/app/(protected)/` — Auth-protected pages (dashboard, settings)
- `src/app/admin/` — Admin panel
- `src/app/api/` — API route handlers (webhooks, AI, payments)
- `src/components/` — Shared React components
- `src/lib/` — Utilities, Prisma client, query helpers
- `src/hooks/` — Custom React hooks
- `src/contexts/` — React context providers
- `prisma/` — Schema and migrations

## Running the App
- **Dev**: `npm run dev` (runs `prisma generate` then Next.js on port 5000)
- **Build**: `npm run build`
- **Start**: `npm run start` (port 5000, 0.0.0.0)

## Required Secrets
All secrets are stored in Replit Secrets:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk publishable key
- `CLERK_SECRET_KEY` — Clerk secret key
- `CLERK_WEBHOOK_SECRET` — Clerk webhook signing secret
- `ASAAS_API_KEY` — Asaas payment API key
- `ASAAS_WEBHOOK_SECRET` — Asaas webhook verification token
- `OPENROUTER_API_KEY` — OpenRouter AI API key
- `DATABASE_URL` — PostgreSQL connection string (auto-managed by Replit)

## Database
- Prisma migrations are in `prisma/migrations/`
- To apply migrations: `npx prisma migrate deploy`
- To push schema changes: `npm run db:push`
- To open Prisma Studio: `npm run db:studio`

## Replit-Specific Configuration
- Port: **5000** (required by Replit webview)
- Host: **0.0.0.0**
- `next.config.ts` has `allowedDevOrigins` set for `*.replit.dev` and `*.repl.co`
- Node.js 22 module is installed (matches project `engines` requirement)
