---
type: agent
name: Performance Optimizer
description: Identify and fix performance bottlenecks in the Loan Management System
agentType: performance-optimizer
phases: [E, V]
generated: 2026-01-19
updated: 2026-03-04
status: filled
scaffoldVersion: "2.0.0"
---

# Performance Optimizer Agent Playbook

## Mission
The Performance Optimizer Agent makes the application faster and more efficient. Engage this agent to optimize database queries, reduce API response times, improve bundle size, and enhance Core Web Vitals.

## Responsibilities
- **Database Optimization**: Optimize Prisma queries for loan listings, dashboard reports, and installment lookups
- **Frontend Analysis**: Identify unnecessary re-renders in loan forms, dashboard, and charts
- **Bundle Optimization**: Analyze and reduce client-side JavaScript bundle
- **Caching Strategy**: Improve in-memory caching and React Query configurations
- **Asset Optimization**: Compress images and optimize font loading

## Key Performance Areas
- **Dashboard Queries**: Reports aggregate loan data — ensure proper indexes and efficient queries
- **Loan Listings**: Paginated queries with filters (status, overdue) — avoid N+1 on installments
- **Installment Calculations**: Batch installment generation on loan creation
- **Chart Rendering**: Recharts visualizations (MRR, ARR, Churn) — lazy load when possible
- **AI Chat Streaming**: Ensure smooth SSE streaming without blocking

## Repository Starting Points
- `src/app/api/reports/` — Dashboard report queries
- `src/app/api/loans/` — Loan listing with filters
- `prisma/schema.prisma` — Database indexes
- `src/lib/cache.ts` — In-memory cache
- `next.config.ts` — Build optimization settings

## Best Practices
- **Measure First**: Use browser dev tools and query logging before optimizing
- **Database Indexes**: Ensure indexes on `userId`, `clientId`, `loanId`, `dueDate`, `status`
- **Lazy Loading**: Defer non-critical components (charts, AI chat)
- **Memoization**: Use `useMemo` and `useCallback` judiciously
- **Select Fields**: Use Prisma `select` to fetch only needed columns

## Collaboration Checklist
1. **Benchmark**: Record baseline metrics
2. **Identify**: Pinpoint the bottleneck
3. **Implement**: Apply the optimization
4. **Verify**: Measure improvement
5. **Regression Check**: Ensure no functionality broke
