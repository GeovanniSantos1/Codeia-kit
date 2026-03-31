import { Decimal } from "@prisma/client/runtime/library";

export type IntervalType = "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "CUSTOM";

export function calculateInterest(principal: number, interestRate: number): number {
  return principal * (interestRate / 100);
}

export function calculateTotalDebt(principal: number, interestRate: number): number {
  return principal + calculateInterest(principal, interestRate);
}

export function calculateInstallmentAmount(totalDebt: number, installmentsCount: number): number {
  return totalDebt / installmentsCount;
}

export function calculateDueDates(
  loanDate: Date,
  installmentsCount: number,
  interval: IntervalType,
  customIntervalDays?: number
): Date[] {
  const dates: Date[] = [];
  for (let i = 1; i <= installmentsCount; i++) {
    const date = new Date(loanDate);
    switch (interval) {
      case "DAILY":
        date.setDate(date.getDate() + i);
        break;
      case "WEEKLY":
        date.setDate(date.getDate() + i * 7);
        break;
      case "BIWEEKLY":
        date.setDate(date.getDate() + i * 15);
        break;
      case "MONTHLY":
        date.setMonth(date.getMonth() + i);
        break;
      case "CUSTOM":
        date.setDate(date.getDate() + i * (customIntervalDays ?? 30));
        break;
    }
    dates.push(date);
  }
  return dates;
}

export function calculatePenalty(
  installmentAmount: number,
  penaltyPerDay: number,
  daysOverdue: number
): number {
  if (daysOverdue <= 0) return 0;
  return installmentAmount * (penaltyPerDay / 100) * daysOverdue;
}

export function calculateDaysOverdue(dueDate: Date, referenceDate?: Date): number {
  const today = referenceDate || new Date();
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffMs = today.getTime() - due.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function generateInstallments(params: {
  loanDate: Date;
  principal: number;
  interestRate: number;
  installmentsCount: number;
  interval: IntervalType;
  customIntervalDays?: number;
}) {
  const totalDebt = calculateTotalDebt(params.principal, params.interestRate);
  const amount = calculateInstallmentAmount(totalDebt, params.installmentsCount);
  const dueDates = calculateDueDates(
    params.loanDate,
    params.installmentsCount,
    params.interval,
    params.customIntervalDays
  );

  return dueDates.map((dueDate, index) => ({
    number: index + 1,
    dueDate,
    amount: Math.round(amount * 100) / 100,
  }));
}

export function decimalToNumber(val: Decimal | null | undefined): number {
  if (val === null || val === undefined) return 0;
  return Number(val);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
}
