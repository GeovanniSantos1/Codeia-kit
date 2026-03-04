---
name: Feature Breakdown
description: Break down features into implementable tasks
---

# Feature Breakdown Skill

## Decomposition Approach
1. **User Flow**: Map the user journey (e.g., "User clicks 'Upgrade', selects plan, pays via Pix, gets credits").
2. **Architecture Layers**:
   - **Database**: Schema changes (migrations).
   - **Backend**: API Routes, Services, Webhooks.
   - **Frontend**: Pages, Components, Hooks, State.
3. **Integration**: External services (Clerk, Asaas, AI).

## Task Estimation Guidelines
- **Small**: < 2 hours (e.g., UI tweak, new field).
- **Medium**: 1 day (e.g., new API endpoint + UI integration).
- **Large**: > 2 days (e.g., new payment method flow). *Break these down further.*

## Dependency Identification
- Does this require a DB migration? (Blocker for code deployment).
- Does this need an env var? (DevOps dependency).
- Does this rely on an external API? (Docs/Sandbox availability).

## Integration Points
- **Auth**: Does it need `middleware.ts` updates?
- **Credits**: Does it consume or grant credits? (`src/lib/credits`).
- **Notifications**: Does it need emails or toast notifications?

## Example Task List
1. `[DB]` Add `subscription_status` to `User` model.
2. `[API]` Create `POST /api/subscription/create` endpoint.
3. `[Service]` Implement `AsaasClient.createSubscription()`.
4. `[UI]` Build `PricingCard` component.
5. `[UI]` Integrate `useSubscription` hook in Pricing page.