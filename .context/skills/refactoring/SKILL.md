---
name: refactoring
description: Safe code refactoring for the Loan Management System
---

# Refactoring Skill

## Common Patterns
- **Extract Utility**: Moving loan logic from API routes to `src/lib/loans/`
- **Custom Hooks**: Extracting stateful logic from components to `src/hooks/`
- **Component Composition**: Breaking large components into smaller sub-components
- **Standardize CRUD**: Ensure loan, client, and transaction APIs follow the same pattern

## Code Smells to Detect
- **Prop Drilling**: Passing data through >3 layers (use Context or Hooks)
- **Hardcoded Strings**: Magic numbers in calculations (use constants)
- **Duplicate Logic**: Same validation or formatting in multiple loan/client forms
- **Large Files**: Files >300 lines
- **Mixed Concerns**: Financial logic in UI components (move to `src/lib`)

## Procedure
1. **Guard**: Ensure tests exist for the code being refactored
2. **Plan**: Identify the specific smell and target pattern
3. **Execute**: Make small, atomic changes
4. **Verify**: Run tests after each change
5. **Clean**: Remove unused imports or dead code

## Testing
- **Regression**: Existing tests MUST pass
- **New Tests**: If refactor exposes new units (e.g., extracted utility), add unit tests
- **Financial Logic**: Extra care with loan calculations — verify with specific test cases
