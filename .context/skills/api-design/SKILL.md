---
name: Api Design
description: Design RESTful APIs following best practices
---

# API Design Skill

## Patterns
- **Resource Oriented**: `/api/resources` (List), `/api/resources/[id]` (Detail/Update/Delete).
- **Controller/Service**: Route handlers (`route.ts`) parse request/auth, then call `src/lib` services.
- **Response Envelope**: Standard JSON response format.

## Naming Conventions
- **URLs**: Kebab-case, plural nouns (e.g., `/api/user-credits`, not `/api/getUserCredits`).
- **Methods**:
  - `GET`: Retrieve.
  - `POST`: Create or Complex Action.
  - `PATCH`: Partial Update.
  - `DELETE`: Remove.

## Request/Response
- **Request**: Validate body using Zod schemas.
- **Response**:
  - Success: `{ data: T }` or just `T` (be consistent).
  - Error: `{ error: { code: string, message: string } }` (See `ApiError`).
- **Status Codes**:
  - 200: OK.
  - 201: Created.
  - 400: Bad Request (Validation).
  - 401: Unauthorized (No session).
  - 403: Forbidden (Wrong role).
  - 404: Not Found.
  - 500: Internal Error.

## Versioning
- Currently using URI versioning or "Evolutionary Database Design" (backward compatible changes).
- Avoid breaking changes; add new fields instead of renaming.