---
name: feature-breakdown
description: Break down loan management features into implementable tasks
---

# Feature Breakdown Skill

## Decomposition Approach
1. **User Flow**: Map the user journey (e.g., "User creates loan → selects client → sets terms → generates installments → tracks payments")
2. **Architecture Layers**:
   - **Database**: Schema changes (migrations)
   - **Backend**: API Routes, Services, Calculations, Webhooks
   - **Frontend**: Pages, Components, Hooks, Forms
3. **Integration**: External services (Clerk, Asaas, OpenRouter)

## Task Estimation Guidelines
- **Small**: < 2 hours (e.g., UI tweak, new filter, additional field)
- **Medium**: 1 day (e.g., new API endpoint + UI integration)
- **Large**: > 2 days (e.g., new payment method flow, reporting dashboard). *Break these down further*

## Dependency Identification
- Does this require a DB migration? (Blocker for code deployment)
- Does this need a new env var? (DevOps dependency)
- Does this rely on loan calculation changes? (Must update `src/lib/loans/calculations.ts`)
- Does this affect installment generation? (Existing loans may need migration)

## Integration Points
- **Auth**: Does it need `middleware.ts` updates or new route protection?
- **Credits**: Does it consume or grant credits? (`src/lib/credits`)
- **Notifications**: Does it need toast notifications or WhatsApp messages?
- **Reports**: Does it affect dashboard metrics? (`src/app/api/reports/`)

## Example Task List (Add Partial Payment Feature)
1. `[DB]` Add `paidAmount` and `paidAt` fields to `Installment` model
2. `[API]` Create `POST /api/loans/[id]/installments/[number]/pay` endpoint
3. `[Service]` Implement partial payment logic with penalty calculation
4. `[UI]` Add "Record Payment" button to InstallmentTable component
5. `[UI]` Build PaymentModal with amount input and confirmation
6. `[Hook]` Create `useRecordPayment` mutation hook
7. `[Test]` Unit test for partial payment calculation
8. `[Test]` E2E test for payment recording flow
