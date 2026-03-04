---
name: Code Review
description: Review code quality, patterns, and best practices
---

# Code Review Skill

## General Guidelines
- **Readability**: Code should be self-documenting. Variable names should be descriptive (e.g., `userCredits` vs `uc`).
- **Simplicity**: Prefer simple solutions. If a function does too much, suggest splitting it.
- **Consistency**: Follow existing patterns (e.g., Service pattern in `src/lib`, Hooks in `src/hooks`).

## Project-Specific Checks
- **Asaas Integration**: Ensure `AsaasClient` is used for payments; check for proper error handling (`try-catch` with `ApiError`).
- **Auth**: Verify that `auth()` or `currentUser()` from Clerk is used correctly.
- **Database**: Check that Prisma queries are optimized (e.g., `select` specific fields, avoid huge `include`s).
- **Client/Server**: Ensure sensitive logic stays on the server (API routes/Server Actions) and isn't leaked to Client Components.

## Security & Performance
- **SQL Injection**: Prisma handles this, but watch out for raw queries.
- **XSS**: Ensure user input rendered in React is safe.
- **RSC**: Check if components are marked `use client` unnecessarily.
- **Images**: Verify usage of `next/image` with proper sizing.