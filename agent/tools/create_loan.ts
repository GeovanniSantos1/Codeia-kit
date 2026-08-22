import { defineTool } from "eve/tools";
import { z } from "zod";
import { agentMutate } from "../lib/api-client";

export default defineTool({
  description:
    "Cria um novo empréstimo para um cliente. Requer clientId, valor principal, taxa de juros, quantidade de parcelas e intervalo.",
  inputSchema: z.object({
    clientId: z.string().min(1).describe("ID do cliente"),
    loanDate: z.string().optional().describe("Data do empréstimo (ISO ou yyyy-mm-dd). Padrão: hoje"),
    principal: z.number().positive().describe("Valor principal em reais"),
    interestRate: z.number().min(0).describe("Taxa de juros em percentual"),
    installmentsCount: z.number().int().min(1).max(30).describe("Quantidade de parcelas"),
    interval: z
      .enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "CUSTOM"])
      .describe("Intervalo entre parcelas"),
    customIntervalDays: z.number().int().min(1).max(365).optional().describe("Dias entre parcelas (obrigatório se interval=CUSTOM)"),
    penaltyPerDay: z.number().min(0).optional().describe("Multa por dia de atraso em percentual"),
  }),
  async execute({ loanDate, ...rest }) {
    return agentMutate("POST", "/api/agent/loans", {
      ...rest,
      loanDate: loanDate ?? new Date().toISOString().slice(0, 10),
      penaltyPerDay: rest.penaltyPerDay ?? 0,
    });
  },
});
