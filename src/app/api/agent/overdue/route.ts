import { NextRequest, NextResponse } from "next/server";
import { getOverdueInstallments } from "@/lib/loans/queries";
import { agentError, agentUnauthorized, verifyAgentInternalAuth } from "@/lib/agent/auth";
import { resolveLoanOwnerUserId } from "@/lib/agent/owner";

export async function GET(req: NextRequest) {
  if (!verifyAgentInternalAuth(req)) return agentUnauthorized();

  try {
    const userId = await resolveLoanOwnerUserId();
    const url = new URL(req.url);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || "30")));
    const overdue = await getOverdueInstallments(userId);

    return NextResponse.json({
      total: overdue.length,
      parcelas: overdue.slice(0, limit).map((item) => ({
        id: item.id,
        emprestimoId: item.loanId,
        cliente: item.clientName,
        whatsapp: item.clientWhatsapp,
        vencimento: item.dueDate,
        valor: item.amount,
        multa: item.penalty,
        diasAtraso: item.daysOverdue,
        status: item.status,
      })),
    });
  } catch (error) {
    console.error("[Agent API] overdue:", error);
    return agentError(error instanceof Error ? error.message : "Erro interno");
  }
}
