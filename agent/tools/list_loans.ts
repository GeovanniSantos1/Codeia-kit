import { defineTool } from "eve/tools";
import { z } from "zod";
import { agentFetch } from "../lib/api-client";

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
    return agentFetch("/api/agent/loans", {
      status,
      overdueOnly,
      clientName,
      limit,
    });
  },
});
