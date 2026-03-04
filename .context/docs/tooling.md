---
type: doc
name: tooling
description: Scripts, IDE settings, automation, and developer productivity tips
category: tooling
generated: 2026-01-19
status: filled
scaffoldVersion: "2.0.0"
---

# Tooling & Productivity Guide

## Tooling & Productivity Guide
This project uses a standard Node.js/Next.js toolchain. We leverage automation to keep the developer experience consistent and fast.

## Required Tooling
- **Node.js**: v18+ (Use `nvm use` to sync).
- **Package Manager**: NPM (Lockfile: `package-lock.json`).
- **Database**: Docker (optional, for local Postgres) or a hosted Postgres instance (Supabase/Neon).
- **VS Code**: Recommended editor.

## Recommended Automation
- **Format on Save**: Configure your editor to run Prettier on save.
- **Linting**: `npm run lint` catches issues early.
- **Database Generation**: `npx prisma generate` runs automatically after install, but run it manually if type definitions for the DB are missing.
- **Scripts**:
  - `npm run dev`: Start dev server.
  - `npm run build`: Production build.
  - `npm run start`: Start production server.
  - `npm run db:push`: Push schema changes to DB (prototyping).
  - `npm run db:migrate`: Create a migration (production changes).

## IDE / Editor Setup
- **VS Code Extensions**:
  - **ESLint**: Real-time linting.
  - **Prettier**: Code formatting.
  - **Prisma**: Syntax highlighting for `.schema`.
  - **Tailwind CSS**: IntelliSense for classes.
- **Settings**:
  ```json
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
  ```

## Productivity Tips
- **Aliases**: Add `alias nr="npm run"` to your shell.
- **Prisma Studio**: Run `npx prisma studio` to view and edit database records in a GUI.
- **Clerk Dashboard**: Keep the Clerk dashboard open to manage users during development.
- **Asaas Sandbox**: Use the Asaas Sandbox environment for testing payments without real money.
