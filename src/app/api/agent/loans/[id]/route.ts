import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decimalToNumber } from "@/lib/loans/calculations";
import { agentError, agentUnauthorized, verifyAgentInternalAuth } from "@/lib/agent/auth";
import { resolveLoanOwnerUserId } from "@/lib/agent/owner";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAgentInternalAuth(req)) return agentUnauthorized();

  try {
    const { id } = await params;
    const userId = await resolveLoanOwnerUserId();

    const loan = await db.loan.findFirst({
      where: { id, userId },
      include: {
        client: true,
        installments: { orderBy: { number: "asc" } },
      },
    });

    if (!loan) {
      return NextResponse.json({ found: false, message: "Empréstimo não encontrado." });
    }

    const principal = decimalToNumber(loan.principal);
    const interestRate = decimalToNumber(loan.interestRate);
    const totalDebt = principal * (1 + interestRate / 100);

    return NextResponse.json({
      found: true,
      id: loan.id,
      cliente: loan.client.name,
      clienteWhatsapp: loan.client.whatsapp,
      status: loan.status,
      data: loan.loanDate.toISOString(),
      principal,
      jurosPercentual: interestRate,
      totalComJuros: totalDebt,
      parcelas: loan.installmentsCount,
      intervalo: loan.interval,
      multaPorDia: decimalToNumber(loan.penaltyPerDay),
      installments: loan.installments.map((inst) => ({
        numero: inst.number,
        vencimento: inst.dueDate.toISOString(),
        valor: decimalToNumber(inst.amount),
        pago: decimalToNumber(inst.paidAmount) || 0,
        multa: decimalToNumber(inst.penalty),
        status: inst.status,
      })),
    });
  } catch (error) {
    console.error("[Agent API] loan detail:", error);
    return agentError(error instanceof Error ? error.message : "Erro interno");
  }
}
