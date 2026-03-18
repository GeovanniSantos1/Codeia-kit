---
type: doc
name: README
description: Documentation index and knowledge base entry point for the Loan Management System
category: index
generated: 2026-01-19
updated: 2026-03-18
status: filled
scaffoldVersion: "2.0.0"
---

# Documentation Index

Welcome to the **Loan Management System** (Sistema de Gestão de Empréstimos) knowledge base. Start with the project overview, then dive into specific guides as needed.

## Core Guides
- [Project Overview](./project-overview.md) — What this app does, tech stack, features
- [Architecture Notes](./architecture.md) — System design, layers, patterns, integrations
- [Development Workflow](./development-workflow.md) — Branching, local dev, code review
- [Testing Strategy](./testing-strategy.md) — Test frameworks, coverage, quality gates
- [Glossary & Domain Concepts](./glossary.md) — Loan, Client, Installment, Transaction terms
- [Security & Compliance Notes](./security.md) — Auth, secrets, LGPD, data protection
- [Tooling & Productivity Guide](./tooling.md) — Scripts, IDE setup, tips

## AI Agent Resources
- [Agent Handbook](../agents/README.md) - Role-based playbooks for implementation, review, and delivery
- [Skills Index](../skills/README.md) - Task-specific procedures for support, review, testing, and documentation
- [Customer Support Skill](../skills/customer-support/SKILL.md) - Draft customer replies, reuse templates, and decide when to escalate

## Repository Snapshot
- `prisma/` — Database schema, migrations, generated client
- `src/app/` — Next.js App Router (pages, API routes, layouts)
- `src/components/` — ~134 React components (ui, loans, admin, ai-chat, billing, charts)
- `src/lib/` — Business logic (loans, credits, asaas, storage, auth, queries)
- `src/hooks/` — Custom React hooks (dashboard, credits, subscription, chat)
- `src/contexts/` — React context providers
- `tests/` — Unit (Vitest) and E2E (Playwright) tests
- `public/` — Static assets
- `package.json` — Dependencies and scripts
- Configuration: `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`

## Document Map
| Guide | File | Primary Inputs |
| --- | --- | --- |
| Project Overview | `project-overview.md` | App purpose, features, tech stack, entry points |
| Architecture Notes | `architecture.md` | Layers, patterns, integrations, API surface |
| Development Workflow | `development-workflow.md` | Branching, local dev, code review, CI |
| Testing Strategy | `testing-strategy.md` | Vitest, Playwright, coverage, quality gates |
| Glossary & Domain Concepts | `glossary.md` | Loan domain terms, enums, personas, business rules |
| Security & Compliance Notes | `security.md` | Auth, RBAC, secrets, LGPD compliance |
| Tooling & Productivity Guide | `tooling.md` | npm scripts, IDE config, Prisma Studio |
