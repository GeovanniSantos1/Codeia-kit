import { defineTool } from "eve/tools";
import { z } from "zod";
import { agentFetch } from "../lib/api-client";

export default defineTool({
  description:
    "Retorna métricas gerais dos empréstimos ativos: total emprestado, recebido, a receber, inadimplentes e vencimentos de hoje.",
  inputSchema: z.object({}),
  async execute() {
    return agentFetch("/api/agent/dashboard-metrics");
  },
});
