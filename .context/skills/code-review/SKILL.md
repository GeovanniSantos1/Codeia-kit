---
name: code-review
description: Review code quality, patterns, and best practices for the Loan Management System
---

# Code Review Skill

## General Guidelines
- **Readability**: Code should be self-documenting. Descriptive variable names (e.g., `loanPrincipal` not `lp`)
- **Simplicity**: Prefer simple solutions. Split complex functions
- **Consistency**: Follow existing patterns (Service pattern in `src/lib`, Hooks in `src/hooks`)

## Project-Specific Checks
- **Data Isolation**: CRITICAL — every loan/client/transaction query MUST filter by `userId`
- **Loan Calculations**: Verify math in `src/lib/loans/calculations.ts` — interest, installments, penalties
- **Auth**: Verify `auth()` or `validateUserAuthentication()` in all API routes
- **Asaas Integration**: Proper error handling with `try-catch` and `ApiError`
- **Database**: Prisma queries optimized (use `select`, avoid huge `include`s)
- **Client/Server**: Financial logic stays server-side, not in Client Components

## Security & Performance
- **SQL Injection**: Prisma handles this, but watch for raw queries
- **XSS**: Ensure user input rendered in React is safe
- **RSC**: Check if components are marked `use client` unnecessarily
- **Images**: Verify `next/image` usage with proper sizing
- **N+1 Queries**: Check for loops making individual DB calls
