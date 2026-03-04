---
type: doc
name: glossary
description: Project terminology, type definitions, domain entities, and business rules
category: glossary
generated: 2026-01-19
status: filled
scaffoldVersion: "2.0.0"
---

# Glossary & Domain Concepts

## Glossary & Domain Concepts
This document defines the key terms and concepts used throughout the project. It serves as a shared vocabulary for developers, designers, and stakeholders.

## Type Definitions
- **[User](src/hooks/admin/use-admin-users.ts)**: A registered user in the system, synced from Clerk.
- **[CreditData](src/hooks/use-credits.ts)**: Represents the user's credit balance and transaction history.
- **[BillingPlan](src/components/admin/plans/types.ts)**: A subscription tier (e.g., Free, Pro) with pricing and features.
- **[AsaasSubscription](src/lib/asaas/client.ts)**: A recurring payment agreement managed by Asaas.

## Enumerations
- **[BillingPeriod](src/components/plans/pricing-utils.ts)**: `MONTHLY` | `YEARLY` - Frequency of subscription billing.
- **[SubscriptionStatus](src/hooks/use-subscription.ts)**: `ACTIVE` | `OVERDUE` | `CANCELED` - The state of a user's subscription.
- **[AsaasEventType](src/app/api/webhooks/asaas/route.ts)**: Webhook event types (e.g., `PAYMENT_RECEIVED`, `SUBSCRIPTION_CREATED`).

## Core Terms
- **Credits**: The internal currency used to consume AI features (Image Generation, Chat). Credits are purchased via one-time packs or monthly subscriptions.
- **Organization**: (Future) A group of users sharing resources. currently, the system is User-centric.
- **Webhook**: A server-to-server notification. We rely heavily on Clerk (User updates) and Asaas (Payment updates) webhooks.
- **Metadata**: Custom data attached to Clerk users or Asaas subscriptions to link them (e.g., `clerkId` stored in Asaas).

## Acronyms & Abbreviations
- **PIX**: Instant payment system in Brazil (supported by Asaas).
- **RSC**: React Server Components (Next.js 13+ feature).
- **DTO**: Data Transfer Object.
- **UI**: User Interface (specifically the `src/components/ui` library).

## Personas / Actors
- **Subscriber**: A user who pays for a plan to get recurring credits.
- **Admin**: A super-user with access to `/admin` to manage plans, view users, and troubleshoot payments.
- **Guest**: An unauthenticated visitor exploring the landing page.

## Domain Rules & Invariants
- **Credit Balance**: Cannot be negative. Operations verify balance *before* deduction.
- **Unique Email**: A user email must be unique across the system (enforced by Clerk).
- **Plan Features**: Access to certain AI models is gated by the active Plan (e.g., "Pro" gets GPT-4).
- **Payment Currency**: All transactions are in BRL (Brazilian Real).
