import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decimalToNumber } from "@/lib/loans/calculations";
import { agentError, agentUnauthorized, verifyAgentInternalAuth } from "@/lib/agent/auth";
import { resolveLoanOwnerUserId } from "@/lib/agent/owner";
import { cancelLoanForUser, updateLoanForUser } from "@/lib/agent/services";

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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAgentInternalAuth(req)) return agentUnauthorized();

  try {
    const { id } = await params;
    const userId = await resolveLoanOwnerUserId();
    const body = await req.json();
    const result = await updateLoanForUser(userId, id, body);

    if ("error" in result && !("loan" in result)) {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: result.status }
      );
    }

    const { loan } = result;
    return NextResponse.json({
      success: true,
      id: loan.id,
      cliente: loan.client.name,
      status: loan.status,
      multaPorDia: decimalToNumber(loan.penaltyPerDay),
    });
  } catch (error) {
    console.error("[Agent API] update loan:", error);
    return agentError(error instanceof Error ? error.message : "Erro interno");
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAgentInternalAuth(req)) return agentUnauthorized();

  try {
    const { id } = await params;
    const userId = await resolveLoanOwnerUserId();
    const result = await cancelLoanForUser(userId, id);

    if ("error" in result && !("loan" in result)) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { loan } = result;
    return NextResponse.json({
      success: true,
      id: loan.id,
      cliente: loan.client.name,
      status: loan.status,
      message: "Empréstimo cancelado com sucesso.",
    });
  } catch (error) {
    console.error("[Agent API] cancel loan:", error);
    return agentError(error instanceof Error ? error.message : "Erro interno");
  }
}
