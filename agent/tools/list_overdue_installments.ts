import { defineTool } from "eve/tools";
import { z } from "zod";
import { getOverdueInstallments } from "@/lib/loans/queries";
import { resolveLoanOwnerUserId } from "../lib/owner";

export default defineTool({
  description:
    "Lista parcelas inadimplentes (vencidas e não pagas) com cliente, valor, multa e dias de atraso.",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(100).optional(),
  }),
  async execute({ limit = 30 }) {
    const userId = await resolveLoanOwnerUserId();
    const overdue = await getOverdueInstallments(userId);

    return {
      total: overdue.length,
      parcelas: overdue.slice(0, limit).map((item) => ({
        id: item.id,
        emprestimoId: item.loanId,
        cliente: item.clientName,
        whatsapp: item.clientWhatsapp,
        vencimento: item.dueDate,
        valor: item.amount,
        multa: item.penalty,
        diasAtraso: item.daysOverdue,
        status: item.status,
      })),
    };
  },
});
