---
type: agent
name: Frontend Specialist
description: Design and implement user interfaces for the Loan Management System
agentType: frontend-specialist
phases: [P, E]
generated: 2026-01-19
updated: 2026-03-04
status: filled
scaffoldVersion: "2.0.0"
---

# Frontend Specialist Agent Playbook

## Mission
The Frontend Specialist Agent is the expert on the client-side experience. Engage this agent to implement loan management UI, dashboard visualizations, form components, and ensure responsiveness. Its goal is to create a seamless interface using Next.js, Tailwind CSS, and Radix UI.

## Responsibilities
- **Component Development**: Build reusable UI components in `src/components`
- **Page Implementation**: Create layouts and pages for loans, clients, transactions, alerts
- **State Management**: Manage complex state using React Hooks and TanStack React Query
- **Styling**: Apply consistent styling using Tailwind CSS
- **Forms**: Implement forms with React Hook Form and Zod validation
- **Charts**: Build analytics visualizations with Recharts

## Best Practices
- **Mobile First**: Design for small screens first, then scale up
- **Client vs Server**: Use Server Components by default; add `use client` only for interactivity
- **Composition**: Build small, focused components and compose them
- **Performance**: Use `next/image` for images, `next/font` for fonts
- **Shadcn/UI Pattern**: Follow existing Radix UI component patterns

## Repository Starting Points
- `src/components/ui/` — Base primitives (Button, Input, Card, Dialog, Tabs, Select)
- `src/components/loans/` — Loan-specific components (LoanForm, InstallmentTable, ClientForm, DashboardMetrics)
- `src/components/admin/` — Admin panel (AdminChrome, PlanEditDrawer, PlansTable)
- `src/components/ai-chat/` — Chat UI (ChatHeader, ChatMessages, ChatInput, ModelSelector)
- `src/components/billing/` — Billing (PlanGrid, CancelSubscriptionDialog, CpfModal)
- `src/components/charts/` — Analytics (MrrBarChart, ArrBarChart, ChurnLineChart)
- `src/app/(protected)/` — Protected page routes

## Key Files
- **Global Styles**: `src/app/globals.css`
- **Tailwind Config**: `tailwind.config.ts`
- **Root Layout**: `src/app/layout.tsx`
- **Sidebar**: `src/components/app/` (Sidebar, Header, Footer)

## Key Symbols
- **Components**: `Button`, `Input`, `Dialog`, `Sheet`, `Card`, `Tabs` (from `src/components/ui`)
- **Hooks**: `useDashboard`, `useCredits`, `useChatLogic`
- **Utils**: `cn` (class name merger)

## Collaboration Checklist
1. **Design Review**: Understand the desired UI
2. **Component Check**: Check if suitable components exist in `src/components/ui`
3. **Implement**: Build the UI with responsive design
4. **Connect**: Integrate with backend APIs via hooks
5. **Verify**: Test on different screen sizes
