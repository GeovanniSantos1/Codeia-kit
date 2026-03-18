# Skills

On-demand expertise for AI agents. Skills are task-specific procedures that get activated when relevant.

> Project: Loan Management System (Sistema de Gestão de Empréstimos)

## How Skills Work

1. **Discovery**: AI agents discover available skills
2. **Matching**: When a task matches a skill's description, it's activated
3. **Execution**: The skill's instructions guide the AI's behavior

## Available Skills

### Built-in Skills

| Skill | Description | Phases |
|-------|-------------|--------|
| [Commit Message](./commit-message/SKILL.md) | Generate commit messages following conventional commits with scope detection | E, C |
| [Pr Review](./pr-review/SKILL.md) | Review pull requests against team standards and best practices | R, V |
| [Code Review](./code-review/SKILL.md) | Review code quality, patterns, and best practices | R, V |
| [Test Generation](./test-generation/SKILL.md) | Generate comprehensive test cases for loan calculations, API routes, and E2E flows | E, V |
| [Documentation](./documentation/SKILL.md) | Generate and update technical documentation | P, C |
| [Refactoring](./refactoring/SKILL.md) | Safe code refactoring with step-by-step approach | E |
| [Bug Investigation](./bug-investigation/SKILL.md) | Systematic bug investigation for loan, billing, and auth issues | E, V |
| [Feature Breakdown](./feature-breakdown/SKILL.md) | Break down loan management features into implementable tasks | P |
| [Api Design](./api-design/SKILL.md) | Design RESTful APIs for loans, clients, transactions, and reports | P, R |
| [Security Audit](./security-audit/SKILL.md) | Security review for data isolation, auth, and financial data protection | R, V |
| [Customer Support](./customer-support/SKILL.md) | Draft customer-facing support replies and reusable response templates | E, C |
| [Support Escalation](./support-escalation/SKILL.md) | Triage support cases and route escalations with the right urgency | P, E, C |

## Creating Custom Skills

Create a new skill by adding a directory with a `SKILL.md` file:

```text
.context/skills/
`-- my-skill/
    |-- SKILL.md          # Required: skill definition
    `-- references/       # Optional: helper resources
        `-- guide.md
```

## PREVC Phase Mapping

| Phase | Name | Skills |
|-------|------|--------|
| P | Planning | feature-breakdown, documentation, api-design, support-escalation |
| R | Review | pr-review, code-review, api-design, security-audit |
| E | Execution | commit-message, test-generation, refactoring, bug-investigation, customer-support, support-escalation |
| V | Validation | pr-review, code-review, test-generation, security-audit |
| C | Confirmation | commit-message, documentation, customer-support, support-escalation |
