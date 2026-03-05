import { db } from "@/lib/db";
import { decimalToNumber } from "./calculations";

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
}

function getLast6Months(): Date[] {
  const months: Date[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d);
  }
  return months;
}

function getMonthRange(monthStart: Date): { start: Date; end: Date } {
  const start = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
  const end = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
  return { start, end };
}

export async function getDashboardCharts(userId: string) {
  const months = getLast6Months();
  const sixMonthsAgo = months[0];
  const now = new Date();
  const endOfRange = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [transactions, loans, installments, usageHistory] = await Promise.all([
    db.transaction.findMany({
      where: {
        userId,
        date: { gte: sixMonthsAgo, lt: endOfRange },
      },
      select: { type: true, amount: true, date: true },
      orderBy: { date: "asc" },
    }),
    db.loan.findMany({
      where: {
        userId,
        createdAt: { gte: sixMonthsAgo, lt: endOfRange },
      },
      select: { principal: true, createdAt: true },
    }),
    db.installment.findMany({
      where: {
        loan: { userId },
        dueDate: { gte: sixMonthsAgo, lt: endOfRange },
      },
      select: { status: true, amount: true, paidAmount: true, dueDate: true },
    }),
    db.usageHistory.findMany({
      where: {
        userId,
        timestamp: { gte: sixMonthsAgo, lt: endOfRange },
      },
      select: { operationType: true, creditsUsed: true, timestamp: true },
    }),
  ]);

  // 1. Transactions chart: Entrada vs Saída per month
  const transactionsSeries = months.map((m) => {
    const { start, end } = getMonthRange(m);
    let entrada = 0;
    let saida = 0;
    for (const t of transactions) {
      const d = new Date(t.date);
      if (d >= start && d < end) {
        const amount = decimalToNumber(t.amount);
        if (t.type === "ENTRADA") entrada += amount;
        else saida += amount;
      }
    }
    return {
      label: getMonthLabel(m),
      entrada: Math.round(entrada * 100) / 100,
      saida: Math.round(saida * 100) / 100,
    };
  });

  // 2. Loans created per month + total principal
  const loansSeries = months.map((m) => {
    const { start, end } = getMonthRange(m);
    let count = 0;
    let totalPrincipal = 0;
    for (const l of loans) {
      const d = new Date(l.createdAt);
      if (d >= start && d < end) {
        count++;
        totalPrincipal += decimalToNumber(l.principal);
      }
    }
    return {
      label: getMonthLabel(m),
      count,
      totalPrincipal: Math.round(totalPrincipal * 100) / 100,
    };
  });

  // 3. Installments: paid vs pending vs overdue per month
  const installmentsSeries = months.map((m) => {
    const { start, end } = getMonthRange(m);
    let paid = 0;
    let pending = 0;
    let overdue = 0;
    for (const inst of installments) {
      const d = new Date(inst.dueDate);
      if (d >= start && d < end) {
        if (inst.status === "PAID") paid++;
        else if (inst.status === "OVERDUE") overdue++;
        else pending++;
      }
    }
    return { label: getMonthLabel(m), paid, pending, overdue };
  });

  // 4. Credit usage per month (AI chat vs image generation)
  const creditsSeries = months.map((m) => {
    const { start, end } = getMonthRange(m);
    let chatCredits = 0;
    let imageCredits = 0;
    for (const u of usageHistory) {
      const d = new Date(u.timestamp);
      if (d >= start && d < end) {
        if (u.operationType === "AI_TEXT_CHAT") chatCredits += u.creditsUsed;
        else if (u.operationType === "AI_IMAGE_GENERATION") imageCredits += u.creditsUsed;
      }
    }
    return { label: getMonthLabel(m), chat: chatCredits, image: imageCredits };
  });

  return {
    transactionsSeries,
    loansSeries,
    installmentsSeries,
    creditsSeries,
  };
}
