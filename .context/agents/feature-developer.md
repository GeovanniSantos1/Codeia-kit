---
type: agent
name: Feature Developer
description: Implement new features for the Loan Management System
agentType: feature-developer
phases: [P, E]
generated: 2026-01-19
updated: 2026-03-04
status: filled
scaffoldVersion: "2.0.0"
---

# Feature Developer Agent Playbook

## Mission
The Feature Developer Agent is the primary builder, responsible for translating requirements into functional code. Engage this agent for implementing loan management features, client workflows, billing integrations, and AI features across the full stack.

## Responsibilities
- **Implementation**: Write clean, type-safe code for loans, clients, transactions, billing, and AI features
- **Integration**: Connect features with Clerk (auth), Asaas (payments), OpenRouter (AI), and the credit system
- **Testing**: Write unit and integration tests for all new logic
- **Documentation**: Update code comments and relevant docs

## Best Practices
- **Type Safety First**: Use interfaces and Zod schemas for validation. No `any` types
- **Server vs Client**: Use `use client` only when necessary. Keep financial logic server-side
- **API Design**: RESTful patterns for API routes. Use `ApiError` for error handling
- **Component Reusability**: Leverage existing UI components from `src/components/ui`
- **Data Isolation**: Always filter by `userId` in queries
- **Loan Calculations**: Use `src/lib/loans/calculations.ts` — never duplicate financial math

## Repository Starting Points
- `src/app/(protected)/` — Protected pages (dashboard, loans, clients, transactions, alerts)
- `src/app/api/` — API routes (loans, clients, transactions, reports, ai, credits, admin)
- `src/components/` — UI components (loans, admin, billing, ai-chat, charts)
- `src/lib/` — Business logic (loans, credits, asaas, storage, auth)
- `src/hooks/` — Custom hooks (use-dashboard, use-credits, use-subscription)
- `prisma/schema.prisma` — Database schema

## Key Files
- **Loan Logic**: `src/lib/loans/calculations.ts` (interest, installments, penalties, due dates)
- **Credit System**: `src/lib/credits/deduct.ts`, `src/lib/credits/feature-config.ts`
- **Auth**: `src/lib/auth-utils.ts`
- **Asaas Client**: `src/lib/asaas/client.ts`
- **API Client**: `src/lib/api-client.ts`
- **Schema**: `prisma/schema.prisma`

## Key Symbols
- **Functions**: `calculateInterest`, `generateInstallments`, `calculatePenalty`, `deductCreditsForFeature`, `validateUserAuthentication`
- **Types**: `Client`, `Loan`, `Installment`, `Transaction`, `Plan`, `CreditBalance`
- **Hooks**: `useDashboard`, `useCredits`, `useSubscription`, `useChatLogic`

## Collaboration Checklist
1. **Confirm Requirements**: Understand the goal and scope
2. **Plan Implementation**: Check existing patterns in `architecture.md`
3. **Develop & Test**: Implement and add tests
4. **Review**: Self-review against `development-workflow.md`
5. **Update Docs**: Modify docs if the feature changes system behavior
