---
name: Refactoring
description: Safe code refactoring with step-by-step approach
---

# Refactoring Skill

## Common Patterns
- **Extract Utility**: Moving logic from Components or API routes to `src/lib`.
- **Custom Hooks**: Extracting stateful logic from components to `src/hooks`.
- **Component Composition**: Breaking large "God Components" into smaller sub-components in `src/components`.

## Code Smells to Detect
- **Prop Drilling**: Passing data through >3 layers (Suggest Context or Hooks).
- **Hardcoded Strings**: Magic numbers/strings (Suggest Constants or Config).
- **Duplicate Logic**: Same validation or formatting used in multiple places.
- **Large Files**: Files >300 lines (unless it's a complex config or main layout).

## Procedure
1. **Guard**: Ensure tests exist for the code being refactored.
2. **Plan**: Identify the specific smell and the target pattern.
3. **Execute**: Make small, atomic changes.
4. **Verify**: Run tests after each change.
5. **Clean**: Remove unused imports or dead code.

## Testing
- **Regression**: Existing tests MUST pass.
- **New Tests**: If the refactor exposes new units (e.g. a new utility function), add unit tests for it.