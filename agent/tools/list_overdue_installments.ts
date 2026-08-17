import { defineTool } from "eve/tools";
import { z } from "zod";
import { agentFetch } from "../lib/api-client";

export default defineTool({
  description:
    "Lista parcelas inadimplentes (vencidas e não pagas) com cliente, valor, multa e dias de atraso.",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(100).optional(),
  }),
  async execute({ limit = 30 }) {
    return agentFetch("/api/agent/overdue", { limit });
  },
});
