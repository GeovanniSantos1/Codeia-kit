import { db } from "@/lib/db";
import { generateInstallments, decimalToNumber, calculatePenalty, calculateDaysOverdue } from "@/lib/loans/calculations";
import { InstallmentStatus } from "@/lib/prisma-types";
import { z } from "zod";

export const createLoanSchema = z.object({
  clientId: z.string().min(1),
  loanDate: z.string().transform((s) => new Date(s)),
  principal: z.number().positive(),
  interestRate: z.number().min(0),
  installmentsCount: z.number().int().min(1).max(30),
  interval: z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "CUSTOM"]),
  customIntervalDays: z.number().int().min(1).max(365).optional(),
  penaltyPerDay: z.number().min(0).default(0),
}).refine(
  (data) => data.interval !== "CUSTOM" || (data.customIntervalDays != null && data.customIntervalDays > 0),
  { message: "customIntervalDays é obrigatório para intervalo personalizado", path: ["customIntervalDays"] }
);

export const payInstallmentSchema = z.object({
  installmentId: z.string().min(1),
  paidAmount: z.number().positive(),
  paidAt: z
    .string()
    .transform((s) => new Date(s))
    .optional(),
});

export const updateLoanSchema = z.object({
  penaltyPerDay: z.number().min(0).optional(),
  status: z.enum(["ACTIVE", "PAID_OFF", "CANCELLED"]).optional(),
});

export const createClientSchema = z.object({
  name: z.string().min(1).max(200),
  whatsapp: z.string().max(30).optional().nullable(),
  cpf: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  motherName: z.string().max(200).optional().nullable(),
  pix: z.string().max(200).optional().nullable(),
  bank: z.string().max(100).optional().nullable(),
  agency: z.string().max(20).optional().nullable(),
  account: z.string().max(30).optional().nullable(),
  reserve: z.number().optional().nullable(),
  line: z.number().int().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateClientSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  whatsapp: z.string().max(30).optional().nullable(),
  cpf: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  motherName: z.string().max(200).optional().nullable(),
  pix: z.string().max(200).optional().nullable(),
  bank: z.string().max(100).optional().nullable(),
  agency: z.string().max(20).optional().nullable(),
  account: z.string().max(30).optional().nullable(),
  reserve: z.number().optional().nullable(),
  line: z.number().int().optional().nullable(),
  notes: z.string().optional().nullable(),
  tier: z.enum(["INICIANTE", "MAU_PAGADOR", "BOM_PAGADOR", "OURO", "BLOQUEADO"]).optional().nullable(),
});

export async function createLoanForUser(userId: string, body: unknown) {
  const parsed = createLoanSchema.safeParse(body);
  if (!parsed.success) {
    return { error: "Dados inválidos", details: parsed.error.flatten(), status: 400 as const };
  }

  const data = parsed.data;
  const client = await db.client.findFirst({
    where: { id: data.clientId, userId },
  });
  if (!client) {
    return { error: "Cliente não encontrado", status: 404 as const };
  }

  const installments = generateInstallments({
    loanDate: data.loanDate,
    principal: data.principal,
    interestRate: data.interestRate,
    installmentsCount: data.installmentsCount,
    interval: data.interval,
    customIntervalDays: data.customIntervalDays,
  });

  const loan = await db.loan.create({
    data: {
      userId,
      clientId: data.clientId,
      loanDate: data.loanDate,
      principal: data.principal,
      interestRate: data.interestRate,
      installmentsCount: data.installmentsCount,
      interval: data.interval,
      customIntervalDays: data.customIntervalDays ?? null,
      penaltyPerDay: data.penaltyPerDay,
      installments: {
        create: installments.map((inst) => ({
          number: inst.number,
          dueDate: inst.dueDate,
          amount: inst.amount,
        })),
      },
    },
    include: {
      installments: { orderBy: { number: "asc" } },
      client: { select: { id: true, name: true } },
    },
  });

  await db.transaction.create({
    data: {
      userId,
      clientId: data.clientId,
      loanId: loan.id,
      type: "SAIDA",
      amount: data.principal,
      date: data.loanDate,
      notes: `Empréstimo concedido para ${client.name}`,
    },
  });

  return { loan, status: 201 as const };
}

export async function payInstallmentForUser(
  userId: string,
  loanId: string,
  body: unknown
) {
  const parsed = payInstallmentSchema.safeParse(body);
  if (!parsed.success) {
    return { error: "Dados inválidos", details: parsed.error.flatten(), status: 400 as const };
  }

  const { installmentId, paidAmount, paidAt } = parsed.data;
  const paymentDate = paidAt || new Date();

  const loan = await db.loan.findFirst({ where: { id: loanId, userId } });
  if (!loan) {
    return { error: "Empréstimo não encontrado", status: 404 as const };
  }

  const installment = await db.installment.findFirst({
    where: { id: installmentId, loanId },
  });
  if (!installment) {
    return { error: "Parcela não encontrada", status: 404 as const };
  }
  if (installment.status === InstallmentStatus.PAID) {
    return { error: "Parcela já paga", status: 400 as const };
  }

  const amount = decimalToNumber(installment.amount);
  const daysOverdue = calculateDaysOverdue(installment.dueDate, paymentDate);
  const penalty = calculatePenalty(amount, decimalToNumber(loan.penaltyPerDay), daysOverdue);
  const totalDue = amount + Math.round(penalty * 100) / 100;

  const previouslyPaid = installment.paidAmount ? decimalToNumber(installment.paidAmount) : 0;
  const remainingBeforePayment = totalDue - previouslyPaid;

  if (paidAmount > remainingBeforePayment * 1.01) {
    return {
      error: `Valor máximo para pagamento: R$ ${remainingBeforePayment.toFixed(2)}`,
      status: 400 as const,
    };
  }

  const newTotalPaid = previouslyPaid + paidAmount;
  const isFullyPaid = newTotalPaid >= totalDue * 0.99;
  const remainingAmount = Math.max(0, totalDue - newTotalPaid);
  const paymentPercentage = totalDue > 0 ? (newTotalPaid / totalDue) * 100 : 0;

  const result = await db.$transaction(async (tx) => {
    const updatedInstallment = await tx.installment.update({
      where: { id: installmentId },
      data: {
        status: isFullyPaid ? InstallmentStatus.PAID : InstallmentStatus.PARTIALLY_PAID,
        paidAt: isFullyPaid ? paymentDate : installment.paidAt,
        paidAmount: newTotalPaid,
        penalty: Math.round(penalty * 100) / 100,
      },
    });

    await tx.transaction.create({
      data: {
        userId,
        clientId: loan.clientId,
        loanId,
        type: "ENTRADA",
        amount: paidAmount,
        date: paymentDate,
        notes: `Pagamento ${isFullyPaid ? "parcela" : "parcial"} ${installment.number}/${loan.installmentsCount}`,
      },
    });

    const remainingCount = await tx.installment.count({
      where: { loanId, status: { not: InstallmentStatus.PAID } },
    });

    if (remainingCount === 0) {
      await tx.loan.update({
        where: { id: loanId },
        data: { status: "PAID_OFF" },
      });
    }

    return {
      updatedInstallment,
      loanPaidOff: remainingCount === 0,
      isFullyPaid,
      remainingAmount,
      paymentPercentage,
    };
  });

  return {
    installment: {
      ...result.updatedInstallment,
      amount: decimalToNumber(result.updatedInstallment.amount),
      paidAmount: result.updatedInstallment.paidAmount
        ? decimalToNumber(result.updatedInstallment.paidAmount)
        : null,
      penalty: decimalToNumber(result.updatedInstallment.penalty),
    },
    loanPaidOff: result.loanPaidOff,
    isFullyPaid: result.isFullyPaid,
    remainingAmount: result.remainingAmount,
    paymentPercentage: Math.round(result.paymentPercentage * 100) / 100,
    status: 200 as const,
  };
}

export async function updateLoanForUser(userId: string, loanId: string, body: unknown) {
  const parsed = updateLoanSchema.safeParse(body);
  if (!parsed.success) {
    return { error: "Dados inválidos", details: parsed.error.flatten(), status: 400 as const };
  }

  const existing = await db.loan.findFirst({ where: { id: loanId, userId } });
  if (!existing) {
    return { error: "Empréstimo não encontrado", status: 404 as const };
  }

  const loan = await db.loan.update({
    where: { id: loanId },
    data: parsed.data,
    include: {
      client: { select: { id: true, name: true } },
      installments: { orderBy: { number: "asc" } },
    },
  });

  return { loan, status: 200 as const };
}

export async function cancelLoanForUser(userId: string, loanId: string) {
  const existing = await db.loan.findFirst({ where: { id: loanId, userId } });
  if (!existing) {
    return { error: "Empréstimo não encontrado", status: 404 as const };
  }

  const loan = await db.loan.update({
    where: { id: loanId },
    data: { status: "CANCELLED" },
    include: { client: { select: { id: true, name: true } } },
  });

  return { loan, status: 200 as const };
}

export async function createClientForUser(userId: string, body: unknown) {
  const parsed = createClientSchema.safeParse(body);
  if (!parsed.success) {
    return { error: "Dados inválidos", details: parsed.error.flatten(), status: 400 as const };
  }

  const data = parsed.data;
  const client = await db.client.create({
    data: {
      userId,
      name: data.name,
      whatsapp: data.whatsapp ?? null,
      cpf: data.cpf ?? null,
      address: data.address ?? null,
      motherName: data.motherName ?? null,
      pix: data.pix ?? null,
      bank: data.bank ?? null,
      agency: data.agency ?? null,
      account: data.account ?? null,
      reserve: data.reserve ?? null,
      line: data.line ?? null,
      notes: data.notes ?? null,
    },
  });

  return { client, status: 201 as const };
}

export async function updateClientForUser(userId: string, clientId: string, body: unknown) {
  const parsed = updateClientSchema.safeParse(body);
  if (!parsed.success) {
    return { error: "Dados inválidos", details: parsed.error.flatten(), status: 400 as const };
  }

  const existing = await db.client.findFirst({ where: { id: clientId, userId } });
  if (!existing) {
    return { error: "Cliente não encontrado", status: 404 as const };
  }

  const data = parsed.data;
  const client = await db.client.update({
    where: { id: clientId },
    data: {
      name: data.name ?? existing.name,
      whatsapp: data.whatsapp !== undefined ? data.whatsapp : existing.whatsapp,
      cpf: data.cpf !== undefined ? data.cpf : existing.cpf,
      address: data.address !== undefined ? data.address : existing.address,
      motherName: data.motherName !== undefined ? data.motherName : existing.motherName,
      pix: data.pix !== undefined ? data.pix : existing.pix,
      bank: data.bank !== undefined ? data.bank : existing.bank,
      agency: data.agency !== undefined ? data.agency : existing.agency,
      account: data.account !== undefined ? data.account : existing.account,
      reserve: data.reserve !== undefined ? data.reserve : existing.reserve,
      line: data.line !== undefined ? data.line : existing.line,
      notes: data.notes !== undefined ? data.notes : existing.notes,
      tier: data.tier !== undefined ? data.tier : existing.tier,
    },
  });

  return { client, status: 200 as const };
}
