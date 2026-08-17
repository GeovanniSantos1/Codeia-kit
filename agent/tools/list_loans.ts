import { defineTool } from "eve/tools";
import { z } from "zod";
import { db } from "@/lib/db";
import { decimalToNumber } from "@/lib/loans/calculations";
import { resolveLoanOwnerUserId } from "../lib/owner";

export default defineTool({
  description:
    "Lista empréstimos com filtros opcionais de status, inadimplência e busca por nome do cliente.",
  inputSchema: z.object({
    status: z.enum(["ACTIVE", "PAID_OFF", "CANCELLED"]).optional(),
    overdueOnly: z.boolean().optional(),
    clientName: z.string().optional(),
    limit: z.number().int().min(1).max(50).optional(),
  }),
  async execute({ status, overdueOnly, clientName, limit = 20 }) {
    const userId = await resolveLoanOwnerUserId();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where: Record<string, unknown> = { userId };
    if (status) where.status = status;

    if (overdueOnly) {
      where.status = "ACTIVE";
      where.installments = {
        some: {
          status: { in: ["PENDING", "OVERDUE"] },
          dueDate: { lt: today },
        },
      };
    }

    const loans = await db.loan.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, tier: true, whatsapp: true } },
        installments: { select: { status: true, dueDate: true, amount: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const filtered = clientName
      ? loans.filter((loan) =>
          loan.client.name.toLowerCase().includes(clientName.toLowerCase())
        )
      : loans;

    return {
      total: filtered.length,
      loans: filtered.map((loan) => {
        const principal = decimalToNumber(loan.principal);
        const interestRate = decimalToNumber(loan.interestRate);
        const paidCount = loan.installments.filter((i) => i.status === "PAID").length;

        return {
          id: loan.id,
          cliente: loan.client.name,
          clienteId: loan.client.id,
          whatsapp: loan.client.whatsapp,
          tier: loan.client.tier,
          status: loan.status,
          data: loan.loanDate.toISOString(),
          principal,
          jurosPercentual: interestRate,
          parcelas: loan.installmentsCount,
          parcelasPagas: paidCount,
          intervalo: loan.interval,
        };
      }),
    };
  },
});
