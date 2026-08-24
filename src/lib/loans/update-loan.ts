import { db } from "@/lib/db";
import {
  generateInstallments,
  decimalToNumber,
  type IntervalType,
} from "@/lib/loans/calculations";
import { z } from "zod";

export const updateLoanSchema = z
  .object({
    penaltyPerDay: z.number().min(0).optional(),
    status: z.enum(["ACTIVE", "PAID_OFF", "CANCELLED"]).optional(),
    loanDate: z.string().transform((s) => new Date(s)).optional(),
    principal: z.number().positive().optional(),
    interestRate: z.number().min(0).optional(),
    installmentsCount: z.number().int().min(1).max(30).optional(),
    interval: z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "CUSTOM"]).optional(),
    customIntervalDays: z.number().int().min(1).max(365).optional(),
  })
  .refine(
    (data) =>
      data.interval !== "CUSTOM" ||
      data.customIntervalDays == null ||
      data.customIntervalDays > 0,
    {
      message: "customIntervalDays é obrigatório para intervalo personalizado",
      path: ["customIntervalDays"],
    }
  );

export type UpdateLoanInput = z.infer<typeof updateLoanSchema>;

export async function loanHasPayments(loanId: string): Promise<boolean> {
  const count = await db.installment.count({
    where: {
      loanId,
      OR: [
        { status: { in: ["PAID", "PARTIALLY_PAID"] } },
        { paidAmount: { gt: 0 } },
      ],
    },
  });
  return count > 0;
}

export async function updateLoanForUser(
  userId: string,
  loanId: string,
  body: unknown
) {
  const parsed = updateLoanSchema.safeParse(body);
  if (!parsed.success) {
    return {
      error: "Dados inválidos",
      details: parsed.error.flatten(),
      status: 400 as const,
    };
  }

  const existing = await db.loan.findFirst({
    where: { id: loanId, userId },
    include: { client: true, installments: true },
  });

  if (!existing) {
    return { error: "Empréstimo não encontrado", status: 404 as const };
  }

  const data = parsed.data;
  const hasPayments = await loanHasPayments(loanId);

  const structuralFields = [
    "loanDate",
    "principal",
    "interestRate",
    "installmentsCount",
    "interval",
    "customIntervalDays",
  ] as const;

  const hasStructuralChanges = structuralFields.some(
    (field) => data[field] !== undefined
  );

  if (hasPayments && hasStructuralChanges) {
    return {
      error:
        "Não é possível alterar valor, parcelas ou datas após registrar pagamentos. Apenas a multa por dia pode ser editada.",
      status: 400 as const,
    };
  }

  if (hasStructuralChanges) {
    const loanDate = data.loanDate ?? existing.loanDate;
    const principal = data.principal ?? decimalToNumber(existing.principal);
    const interestRate = data.interestRate ?? decimalToNumber(existing.interestRate);
    const installmentsCount = data.installmentsCount ?? existing.installmentsCount;
    const interval = (data.interval ?? existing.interval) as IntervalType;
    const customIntervalDays =
      interval === "CUSTOM"
        ? (data.customIntervalDays ?? existing.customIntervalDays ?? undefined)
        : undefined;

    if (interval === "CUSTOM" && !customIntervalDays) {
      return {
        error: "customIntervalDays é obrigatório para intervalo personalizado",
        status: 400 as const,
      };
    }

    const installments = generateInstallments({
      loanDate,
      principal,
      interestRate,
      installmentsCount,
      interval,
      customIntervalDays,
    });

    const loan = await db.$transaction(async (tx) => {
      await tx.installment.deleteMany({ where: { loanId } });

      const updated = await tx.loan.update({
        where: { id: loanId },
        data: {
          loanDate,
          principal,
          interestRate,
          installmentsCount,
          interval,
          customIntervalDays: interval === "CUSTOM" ? customIntervalDays : null,
          ...(data.penaltyPerDay !== undefined ? { penaltyPerDay: data.penaltyPerDay } : {}),
          ...(data.status !== undefined ? { status: data.status } : {}),
          installments: {
            create: installments.map((inst) => ({
              number: inst.number,
              dueDate: inst.dueDate,
              amount: inst.amount,
            })),
          },
        },
        include: {
          client: true,
          installments: { orderBy: { number: "asc" } },
        },
      });

      await tx.transaction.updateMany({
        where: { loanId, type: "SAIDA" },
        data: {
          amount: principal,
          date: loanDate,
          notes: `Empréstimo concedido para ${existing.client.name}`,
        },
      });

      return updated;
    });

    return { loan, status: 200 as const };
  }

  const updateData: Record<string, unknown> = {};
  if (data.penaltyPerDay !== undefined) updateData.penaltyPerDay = data.penaltyPerDay;
  if (data.status !== undefined) updateData.status = data.status;

  if (Object.keys(updateData).length === 0) {
    return { error: "Nenhum campo para atualizar", status: 400 as const };
  }

  const loan = await db.loan.update({
    where: { id: loanId },
    data: updateData,
    include: {
      client: true,
      installments: { orderBy: { number: "asc" } },
    },
  });

  return { loan, status: 200 as const };
}
