---
name: documentation
description: Generate and update technical documentation for the Loan Management System
---

# Documentation Skill

## Standards
- **Format**: Markdown (`.md`)
- **Location**: `.context/docs/` for guides, `.context/agents/` for playbooks
- **Language**: English, professional yet accessible

## JSDoc/TSDoc
- Document all exported functions and classes in `src/lib`
- Include `@param`, `@returns`, and `@throws` tags
- Example:
  ```typescript
  /**
   * Generates installments for a loan based on principal, interest, and interval.
   * @param principal - The loan principal amount in BRL
   * @param interestRate - Interest rate as a percentage
   * @param count - Number of installments to generate
   * @param interval - Payment interval (DAILY, WEEKLY, BIWEEKLY, MONTHLY)
   * @param startDate - The loan start date
   * @returns Array of installment objects with dueDate, amount, and number
   */
  export function generateInstallments(...) { ... }
  ```

## README Structure
- **Title & Description**: Loan Management System purpose
- **Getting Started**: Quickest path to running the app
- **Project Structure**: High-level map of directories
- **Key Features**: Loans, clients, transactions, AI, billing, admin
- **Links**: To detailed docs in `.context/docs/`

## API Documentation
- For API Routes (`src/app/api`), document:
  - **Method**: GET, POST, PUT, DELETE
  - **Auth**: Required (Clerk session) or public
  - **Payload**: Request body/query params
  - **Response**: Success and error examples
  - **Data Isolation**: Note `userId` filtering
