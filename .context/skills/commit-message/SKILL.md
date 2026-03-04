---
name: Commit Message
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
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries such as documentation generation

### Scopes
Detect the scope based on the files changed. Common scopes in this project:
- `auth` (Clerk integration, `src/lib/auth-utils.ts`)
- `billing` (Asaas integration, `src/lib/asaas`, `src/components/billing`)
- `admin` (Admin dashboard, `src/app/admin`)
- `api` (API routes in `src/app/api`)
- `ui` (Shared components in `src/components/ui`)
- `db` (Prisma schema or migrations)
- `config` (Environment, Tailwind, Next.js config)

## Examples
- `feat(billing): add cpf validation modal for subscriptions`
- `fix(auth): handle missing user metadata in webhook`
- `refactor(admin): extract plan edit drawer to component`
- `chore(db): add credit_history table migration`

## Best Practices
- Keep the subject line under 72 characters.
- Use the imperative mood in the subject line (e.g., "add" not "added").
- Reference issue numbers in the body if applicable (e.g., "Fixes #123").