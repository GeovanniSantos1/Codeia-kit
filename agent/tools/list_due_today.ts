import { defineTool } from "eve/tools";
import { z } from "zod";
import { getDueTodayInstallments } from "@/lib/loans/queries";
import { resolveLoanOwnerUserId } from "../lib/owner";

export default defineTool({
  description: "Lista parcelas com vencimento hoje.",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(100).optional(),
  }),
  async execute({ limit = 30 }) {
    const userId = await resolveLoanOwnerUserId();
    const dueToday = await getDueTodayInstallments(userId);

    return {
      total: dueToday.length,
      parcelas: dueToday.slice(0, limit).map((item) => ({
        id: item.id,
        emprestimoId: item.loanId,
        cliente: item.clientName,
        whatsapp: item.clientWhatsapp,
        vencimento: item.dueDate,
        valor: item.amount,
        status: item.status,
      })),
    };
  },
});
