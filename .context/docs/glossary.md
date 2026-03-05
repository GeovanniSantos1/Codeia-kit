---
type: doc
name: glossary
description: Project terminology, type definitions, domain entities, and business rules for the Loan Management System
category: glossary
generated: 2026-01-19
updated: 2026-03-04
status: filled
scaffoldVersion: "2.0.0"
---

# Glossary & Domain Concepts

## Core Domain Models

### Loan (Empréstimo)
A financial agreement where a user lends money to a client. Contains principal amount, interest rate, installment count, interval, penalty rate, and status.

### Client (Cliente)
A borrower/debtor who receives loans. Contains personal info (name, CPF, WhatsApp), banking details (PIX, bank, agency, account), and additional fields (mother's name, address, reserve, credit line, notes).

### Installment (Parcela)
An individual payment within a loan. Auto-generated when a loan is created. Contains number, due date, amount, paid amount, paid date, penalty, and status.

### Transaction (Transação)
A financial record of money movement. Typed as ENTRADA (income) or SAIDA (expense). Linked to a user, optionally to a client and loan.

### User (Usuário)
A registered user synced from Clerk. Contains auth info, Asaas customer IDs, current plan, and billing period.

### Plan (Plano)
A subscription tier with pricing (monthly/yearly in BRL), credit allocation, features, and display configuration (badge, highlight, CTA).

### CreditBalance (Saldo de Créditos)
Per-user credit account tracking remaining credits for AI features. Linked to usage history.

## Enumerations

### LoanStatus
- `ACTIVE` — Loan is ongoing with pending installments
- `PAID_OFF` — All installments have been paid
- `CANCELLED` — Loan was cancelled

### InstallmentStatus
- `PENDING` — Payment not yet due or awaiting payment
- `PAID` — Payment received
- `OVERDUE` — Past due date without payment

### PaymentInterval (Interval)
- `DAILY` — Installments due every day
- `WEEKLY` — Installments due every 7 days
- `BIWEEKLY` — Installments due every 14 days
- `MONTHLY` — Installments due every 30 days

### TransactionType
- `ENTRADA` — Income / money received
- `SAIDA` — Expense / money paid out

### OperationType (AI Credits)
- `AI_TEXT_CHAT` — Text chat with AI (1 credit)
- `AI_IMAGE_GENERATION` — Image generation (5 credits)

### SubscriptionStatus
- `ACTIVE` — Active subscription
- `OVERDUE` — Payment overdue
- `CANCELED` — Subscription cancelled

### AsaasEventType
- `PAYMENT_RECEIVED` — Payment confirmed
- `SUBSCRIPTION_CREATED` — New subscription
- `SUBSCRIPTION_DELETED` — Subscription cancelled

## Acronyms & Abbreviations
- **CPF**: Cadastro de Pessoas Físicas (Brazilian individual tax ID)
- **CNPJ**: Cadastro Nacional da Pessoa Jurídica (Brazilian company tax ID)
- **PIX**: Brazilian instant payment system
- **BRL**: Brazilian Real (currency)
- **RSC**: React Server Components
- **MRR**: Monthly Recurring Revenue
- **ARR**: Annual Recurring Revenue

## Personas / Actors
- **Lender (Agiota/Emprestador)**: Authenticated user who creates and manages loans to clients
- **Admin**: Super-user with access to `/admin` for managing plans, users, credits, and analytics
- **Guest**: Unauthenticated visitor on the landing page

## Domain Rules & Invariants
- **Interest Calculation**: Simple interest: `principal * (interestRate / 100)`
- **Total Debt**: `principal + interest`
- **Installment Amount**: `totalDebt / installmentsCount`
- **Penalty**: `penaltyPerDay * daysOverdue` applied to overdue installments
- **Due Date Generation**: Based on interval (daily/weekly/biweekly/monthly) from loan date
- **Credit Balance**: Cannot go negative. Validated before deduction
- **Unique Email**: Enforced by Clerk
- **Data Isolation**: All loan/client/transaction queries filter by `userId`
- **Payment Currency**: All transactions in BRL (Brazilian Real)
- **Asaas Minimum**: Subscriptions require minimum R$ 5.00
- **CPF Required**: CPF/CNPJ validation required for Asaas checkout

## Key Type Definitions
- **[Client](../src/components/loans/types.ts)**: Borrower profile with contact and banking info
- **[Loan](../prisma/schema.prisma)**: Loan agreement with interest, installments, status
- **[Installment](../prisma/schema.prisma)**: Individual payment within a loan
- **[Transaction](../prisma/schema.prisma)**: Financial income/expense record
- **[User](../prisma/schema.prisma)**: Registered user with Clerk and Asaas integration
- **[Plan](../prisma/schema.prisma)**: Subscription tier with pricing and features
- **[CreditBalance](../prisma/schema.prisma)**: Per-user credit account
