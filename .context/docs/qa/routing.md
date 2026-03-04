---
slug: routing
category: architecture
generatedAt: 2026-01-19T17:51:16.539Z
---

# How does routing work?

## Routing

### Next.js App Router

Routes are defined by the folder structure in `app/`:

- `app/page.tsx` → `/`
- `app/about/page.tsx` → `/about`
- `app/blog/[slug]/page.tsx` → `/blog/:slug`

### Detected Route Files

- `src\lib\api-client.ts`
- `src\lib\api-client.ts`