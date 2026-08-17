import { defineTool } from "eve/tools";
import { z } from "zod";
import { agentFetch } from "../lib/api-client";

export default defineTool({
  description: "Busca clientes pelo nome e retorna empréstimos ativos associados.",
  inputSchema: z.object({
    query: z.string().min(1),
    limit: z.number().int().min(1).max(30).optional(),
  }),
  async execute({ query, limit = 10 }) {
    return agentFetch("/api/agent/clients/search", { q: query, limit });
  },
});
