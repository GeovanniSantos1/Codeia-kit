---
slug: error-handling
category: operations
generatedAt: 2026-01-19T17:51:20.947Z
updatedAt: 2026-03-04
relevantFiles:
  - src/lib/api-client.ts
  - src/lib/credits/errors.ts
---

# How are errors handled?

## Error Handling

### Error Classes
- **ApiError** (`src/lib/api-client.ts`): Standard API error with status code and message. Used across all API routes
- **InsufficientCreditsError** (`src/lib/credits/errors.ts`): Thrown when user lacks credits for AI operations

### API Error Responses
All API routes return consistent error format:
```json
{ "error": { "code": "string", "message": "string" } }
```

### HTTP Status Codes
- `200` — Success
- `201` — Created
- `400` — Bad Request (validation failed)
- `401` — Unauthorized (no session)
- `403` — Forbidden (wrong role / not admin)
- `404` — Not Found
- `500` — Internal Server Error

### Frontend Error Handling
- `apiClient` in `src/lib/api-client.ts` wraps fetch with automatic error parsing
- Toast notifications via Sonner for user-facing errors
- React Query error states for data fetching failures

### Credit System Errors
The credit system uses a validate-deduct-refund pattern:
1. Validate credits before operation
2. Deduct credits optimistically
3. If the operation fails, refund credits automatically
