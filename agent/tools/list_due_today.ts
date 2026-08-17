import { defineTool } from "eve/tools";
import { z } from "zod";
import { agentFetch } from "../lib/api-client";

export default defineTool({
  description: "Lista parcelas com vencimento hoje.",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(100).optional(),
  }),
  async execute({ limit = 30 }) {
    return agentFetch("/api/agent/due-today", { limit });
  },
});
