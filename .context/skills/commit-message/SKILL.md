---
name: commit-message
description: Generate commit messages following conventional commits with scope detection
---

# Commit Message Skill

## Format Guidelines
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.
Format: `<type>(<scope>): <description>`

### Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Formatting changes (no logic change)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or correcting tests
- `chore`: Build process or auxiliary tool changes

### Scopes
Detect the scope based on files changed. Common scopes:
- `loans` (Loan management: `src/app/api/loans`, `src/lib/loans`, `src/components/loans`)
- `clients` (Client management: `src/app/api/clients`, `src/components/loans/ClientForm`)
- `transactions` (Financial transactions: `src/app/api/transactions`)
- `installments` (Installment logic and display)
- `auth` (Clerk integration: `src/lib/auth-utils.ts`, `src/middleware.ts`)
- `billing` (Asaas integration: `src/lib/asaas`, `src/components/billing`)
- `credits` (Credit system: `src/lib/credits`)
- `admin` (Admin dashboard: `src/app/admin`, `src/app/api/admin`)
- `api` (General API routes: `src/app/api`)
- `ui` (Shared components: `src/components/ui`)
- `db` (Prisma schema or migrations)
- `ai` (AI chat: `src/app/api/ai`, `src/components/ai-chat`)
- `config` (Environment, Tailwind, Next.js config)

## Examples
- `feat(loans): add penalty calculation for overdue installments`
- `fix(clients): fix CPF validation on client creation`
- `feat(transactions): add monthly/yearly transaction filters`
- `fix(auth): handle missing user in webhook sync`
- `refactor(admin): extract plan edit drawer to component`
- `chore(db): add indexes on installment dueDate and status`

## Best Practices
- Keep subject line under 72 characters
- Use imperative mood ("add" not "added")
- Reference issue numbers in body if applicable
