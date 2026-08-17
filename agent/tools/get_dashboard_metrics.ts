import { defineTool } from "eve/tools";
import { z } from "zod";
import { resolveLoanOwnerUserId } from "../lib/owner";
import { getDashboardMetrics } from "@/lib/loans/queries";

export default defineTool({
  description:
    "Retorna métricas gerais dos empréstimos ativos: total emprestado, recebido, a receber, inadimplentes e vencimentos de hoje.",
  inputSchema: z.object({}),
  async execute() {
    const userId = await resolveLoanOwnerUserId();
    const metrics = await getDashboardMetrics(userId);

    return {
      totalEmprestado: metrics.totalLent,
      totalRecebido: metrics.totalReceived,
      totalAReceber: metrics.totalOwed,
      jurosRecebidos: metrics.receivedInterest,
      jurosAReceber: metrics.provisionInterest,
      emprestimosAtivos: metrics.activeLoansCount,
      parcelasInadimplentes: metrics.overdueCount,
      vencimentosHoje: metrics.dueTodayCount,
    };
  },
});
