import { NextRequest, NextResponse } from "next/server";
import { agentError, agentUnauthorized, verifyAgentInternalAuth } from "@/lib/agent/auth";
import { resolveLoanOwnerUserId } from "@/lib/agent/owner";
import { payInstallmentForUser } from "@/lib/agent/services";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAgentInternalAuth(req)) return agentUnauthorized();

  try {
    const { id: loanId } = await params;
    const userId = await resolveLoanOwnerUserId();
    const body = await req.json();
    const result = await payInstallmentForUser(userId, loanId, body);

    if ("error" in result && !("installment" in result)) {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      parcela: result.installment,
      emprestimoQuitado: result.loanPaidOff,
      parcelaPaga: result.isFullyPaid,
      valorRestante: result.remainingAmount,
      percentualPago: result.paymentPercentage,
    });
  } catch (error) {
    console.error("[Agent API] pay installment:", error);
    return agentError(error instanceof Error ? error.message : "Erro interno");
  }
}
