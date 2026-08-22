import { defineTool } from "eve/tools";
import { z } from "zod";
import { agentMutate } from "../lib/api-client";

export default defineTool({
  description:
    "Registra pagamento de uma parcela de empréstimo. Aceita pagamento parcial ou total.",
  inputSchema: z.object({
    loanId: z.string().min(1).describe("ID do empréstimo"),
    installmentId: z.string().min(1).describe("ID da parcela"),
    paidAmount: z.number().positive().describe("Valor pago em reais"),
    paidAt: z.string().optional().describe("Data do pagamento (ISO). Padrão: hoje"),
  }),
  async execute({ loanId, installmentId, paidAmount, paidAt }) {
    return agentMutate("PUT", `/api/agent/loans/${loanId}/installments`, {
      installmentId,
      paidAmount,
      ...(paidAt ? { paidAt } : {}),
    });
  },
});
