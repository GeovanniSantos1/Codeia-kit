# Fix Breaking Changes Upgrade Plan

> Fix type errors and runtime issues caused by Next.js 15, Prisma, and Vercel Blob updates.

## Task Snapshot
- **Primary goal:** Restore `npm run build` and `npm run typecheck` to a passing state.
- **Success signal:** Clean build output and zero TypeScript errors.
- **Key references:**
  - `package.json`
  - `src/app/api/**/*.ts` (Route Handlers)

## Working Phases
### Phase 1 — Discovery & Alignment
**Steps**
1. [x] Analyze build and typecheck errors.
2. [x] Identify library versions (Next.js 15, Prisma 6, Vercel Blob).
3. [x] Formulate remediation strategy.

### Phase 2 — Implementation & Iteration
**Steps**
1. **Prisma**: Regenerate client (`npx prisma generate`) and fix `UserUpdateInput` in `api/webhooks/users/route.ts`.
2. **Next.js 15**: Update all dynamic API routes to await `params` (approx 40 files).
3. **Vercel Blob**: Update `del` import and `put` options in `src/lib/storage/vercel-blob.ts`.
4. **General Types**: Fix unknown types in `commerce-plans.ts`.

### Phase 3 — Validation & Handoff
**Steps**
1. Run `npm run typecheck` iteratively to verify fixes.
2. Run `npm run build` for final verification.
3. Run `npm run test:unit` to ensure no regression in logic.