---
slug: caching
category: operations
generatedAt: 2026-01-19T17:51:20.947Z
updatedAt: 2026-03-04
relevantFiles:
  - src/lib/cache.ts
---

# How does caching work?

## Caching

### Implementation
The application uses a `SimpleCache` class (`src/lib/cache.ts`) for in-memory caching.

### Key Classes
- **SimpleCache**: Generic in-memory cache with TTL support
- **CacheEntry**: Individual cache entry with timestamp and expiry

### Usage
Caching is primarily used for:
- OpenRouter model list (to avoid repeated API calls)
- Frequently accessed configuration data
- Admin settings

### Data Fetching
Frontend uses TanStack React Query (`@tanstack/react-query`) for client-side caching and data synchronization, with hooks like `use-dashboard`, `use-credits`, `use-subscription`.
