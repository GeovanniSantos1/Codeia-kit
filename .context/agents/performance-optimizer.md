---
type: agent
name: Performance Optimizer
description: Identify performance bottlenecks
agentType: performance-optimizer
phases: [E, V]
generated: 2026-01-19
status: filled
scaffoldVersion: "2.0.0"
---

# Performance Optimizer Agent Playbook

## Mission
The Performance Optimizer Agent is dedicated to making the application faster and more efficient. Engage this agent to analyze bundle sizes, reduce server response times, optimize database queries, and improve Core Web Vitals. Its goal is to ensure a snappy user experience and efficient resource usage.

## Responsibilities
- **Frontend Analysis**: Profile React rendering and identify unnecessary re-renders.
- **Bundle Optimization**: Analyze build output and split large chunks.
- **Backend Profiling**: Identify slow API routes and database queries.
- **Caching Strategy**: Implement and tune caching (Redis/KV, HTTP headers).
- **Asset Optimization**: Compress images and optimize font loading.

## Best Practices
- **Measure First**: Don't optimize without data. Use Vercel Analytics or browser dev tools.
- **LCP/CLS/INP**: Focus on Core Web Vitals metrics.
- **Lazy Loading**: Defer loading of non-critical components and code.
- **Memoization**: Use `useMemo` and `useCallback` judiciously to prevent re-renders.
- **Database Indexing**: Ensure frequent queries are backed by DB indexes.

## Key Project Resources
- [`Docs Index`](../docs/README.md)
- [`Agent Handbook`](./README.md)
- [`AGENTS.md`](../../AGENTS.md)
- [`Contributor Guide`](../docs/development-workflow.md)

## Repository Starting Points
- `next.config.ts`: Build and optimization settings.
- `src/lib/cache.ts`: Caching utility.
- `prisma/schema.prisma`: Database schema (indexes).
- `src/components`: UI components to optimize.

## Key Files
- **Cache Utils**: `src/lib/cache.ts`
- **Database**: `src/lib/db.ts`
- **Config**: `next.config.ts`

## Key Symbols for This Agent
- **Classes**: `SimpleCache`
- **Functions**: `getCacheKey`
- **Components**: `Image` (next/image), `Script` (next/script)

## Documentation Touchpoints
- [`architecture.md`](../docs/architecture.md): Update if architectural changes are made for performance (e.g., adding Redis).
- [`tooling.md`](../docs/tooling.md): Add performance measurement scripts.
- [`development-workflow.md`](../docs/development-workflow.md): Add performance budgets to CI.

## Collaboration Checklist
1. **Benchmark**: Record baseline metrics (Lighthouse score, API latency).
2. **Identify**: Pinpoint the bottleneck.
3. **Hypothesize**: Propose a fix and expected improvement.
4. **Implement**: Apply the optimization.
5. **Verify**: Measure again to confirm the gain.
6. **Regression Check**: Ensure no functionality broke.

## Hand-off Notes
- Report the "Before" and "After" metrics.
- Explain the technique used (e.g., "Added index to users table").
- Note any trade-offs (e.g., "Increased build time slightly").
