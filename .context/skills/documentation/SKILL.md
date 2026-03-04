---
name: Documentation
description: Generate and update technical documentation
---

# Documentation Skill

## Standards
- **Format**: Markdown (`.md`).
- **Location**: `docs/` for guides, `agents/` for playbooks.
- **Language**: English, professional yet accessible.

## JSDoc/TSDoc
- Document all exported functions and classes in `src/lib`.
- Include `@param`, `@returns`, and `@throws` tags.
- Example:
  ```typescript
  /**
   * Deducts credits from a user's wallet.
   * @param userId - The Clerk user ID.
   * @param amount - The number of credits to deduct.
   * @throws {InsufficientCreditsError} If balance is too low.
   * @returns The new balance.
   */
  export async function deductCredits(userId: string, amount: number) { ... }
  ```

## README Structure
- **Title & Description**: Clear value prop.
- **Getting Started**: Quickest path to running the app.
- **Project Structure**: High-level map.
- **Key Features**: Bullet points of capabilities.
- **Links**: To detailed docs in `docs/`.

## API Documentation
- For API Routes (`src/app/api`), document:
  - **Method**: GET, POST, etc.
  - **Auth**: Required role/scope.
  - **Payload**: Request body schema (Zod).
  - **Response**: Success and Error examples.