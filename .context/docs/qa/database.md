---
slug: database
category: features
generatedAt: 2026-01-19T17:51:20.947Z
updatedAt: 2026-03-04
relevantFiles:
  - prisma/schema.prisma
  - src/lib/db.ts
  - src/lib/queries/
---

# How is data stored and accessed?

## Database

### Technology
- **Database**: PostgreSQL
- **ORM**: Prisma 6.16.3
- **Client**: Singleton instance in `src/lib/db.ts`

### Core Models

| Model | Purpose | Key Fields |
|-------|---------|------------|
| **User** | Registered user (synced from Clerk) | clerkId, email, asaasCustomerId, currentPlanId |
| **Client** | Borrower/debtor profile | name, whatsapp, cpf, pix, bank, agency, account |
| **Loan** | Loan agreement | principal, interestRate, installmentsCount, interval, status |
| **Installment** | Individual payment in a loan | number, dueDate, amount, paidAt, paidAmount, penalty, status |
| **Transaction** | Financial record (income/expense) | type (ENTRADA/SAIDA), amount, date, clientId, loanId |
| **Plan** | Subscription tier | name, credits, priceMonthlyCents, priceYearlyCents |
| **CreditBalance** | Per-user credit account | creditsRemaining, lastSyncedAt |
| **UsageHistory** | AI credit consumption log | operationType, creditsUsed, details |
| **StorageObject** | Uploaded files | url, pathname, provider, size, deletedAt |
| **SubscriptionEvent** | Billing audit trail | planKey, status, eventType, metadata |
| **AdminSettings** | Global configuration | featureCosts (JSON) |

### Data Access Patterns
- **Queries layer**: `src/lib/queries/` encapsulates common database queries
- **Data isolation**: All user-facing queries filter by `userId` for multi-tenant safety
- **Indexes**: Strategic indexes on foreign keys and frequently queried fields
- **Enums**: Type-safe enums for LoanStatus, InstallmentStatus, TransactionType, Interval

### Database Commands
```bash
npm run db:push     # Sync schema (development)
npm run db:migrate  # Create migration (production)
npm run db:reset    # Reset database
npm run db:studio   # Open Prisma Studio GUI
```
