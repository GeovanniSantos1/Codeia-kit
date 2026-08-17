import { NextRequest, NextResponse } from "next/server";
import {
  getDashboardMetrics,
  getDueTodayInstallments,
  getOverdueInstallments,
} from "@/lib/loans/queries";
import { agentError, agentUnauthorized, verifyAgentInternalAuth } from "@/lib/agent/auth";
import { resolveLoanOwnerUserId } from "@/lib/agent/owner";

export async function GET(req: NextRequest) {
  if (!verifyAgentInternalAuth(req)) return agentUnauthorized();

  try {
    const userId = await resolveLoanOwnerUserId();
    const metrics = await getDashboardMetrics(userId);

    return NextResponse.json({
      totalEmprestado: metrics.totalLent,
      totalRecebido: metrics.totalReceived,
      totalAReceber: metrics.totalOwed,
      jurosRecebidos: metrics.receivedInterest,
      jurosAReceber: metrics.provisionInterest,
      emprestimosAtivos: metrics.activeLoansCount,
      parcelasInadimplentes: metrics.overdueCount,
      vencimentosHoje: metrics.dueTodayCount,
    });
  } catch (error) {
    console.error("[Agent API] dashboard-metrics:", error);
    return agentError(error instanceof Error ? error.message : "Erro interno");
  }
}
