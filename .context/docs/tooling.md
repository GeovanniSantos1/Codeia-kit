---
type: doc
name: tooling
description: Scripts, IDE settings, automation, and developer productivity tips
category: tooling
generated: 2026-01-19
updated: 2026-03-04
status: filled
scaffoldVersion: "2.0.0"
---

# Tooling & Productivity Guide

## Required Tooling
- **Node.js**: v18+ (LTS recommended)
- **Package Manager**: NPM (lockfile: `package-lock.json`)
- **Database**: PostgreSQL (local, Docker, or hosted like Supabase/Neon)
- **Editor**: VS Code recommended

## NPM Scripts
| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start dev server on port 5000 |
| `build` | `npm run build` | Production build |
| `start` | `npm run start` | Run production server |
| `lint` | `npm run lint` | ESLint check |
| `typecheck` | `npm run typecheck` | TypeScript type checking |
| `format` | `npm run format` | Prettier formatting |
| `db:push` | `npm run db:push` | Sync Prisma schema to DB (prototyping) |
| `db:migrate` | `npm run db:migrate` | Create and run migrations (production) |
| `db:reset` | `npm run db:reset` | Reset database |
| `db:studio` | `npm run db:studio` | Open Prisma Studio GUI |
| `test:unit` | `npm run test:unit` | Run Vitest unit tests |
| `test:e2e` | `npm run test:e2e` | Run Playwright E2E tests |

## IDE / Editor Setup
- **VS Code Extensions**:
  - **ESLint**: Real-time linting
  - **Prettier**: Code formatting
  - **Prisma**: Syntax highlighting for `.prisma` files
  - **Tailwind CSS IntelliSense**: Class autocompletion
- **Settings**:
  ```json
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
  ```

## Productivity Tips
- **Prisma Studio**: Run `npx prisma studio` to view/edit database records (loans, clients, installments)
- **Clerk Dashboard**: Manage users, view auth events
- **Asaas Sandbox**: Test payments without real money using sandbox API key
- **Path Alias**: `@/*` maps to `src/*` — use for all imports
- **React Query DevTools**: Available in dev mode for debugging data fetching
