import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decimalToNumber } from "@/lib/loans/calculations";
import { agentError, agentUnauthorized, verifyAgentInternalAuth } from "@/lib/agent/auth";
import { resolveLoanOwnerUserId } from "@/lib/agent/owner";
import { createLoanForUser } from "@/lib/agent/services";

export async function GET(req: NextRequest) {
  if (!verifyAgentInternalAuth(req)) return agentUnauthorized();

  try {
    const userId = await resolveLoanOwnerUserId();
    const url = new URL(req.url);
    const status = url.searchParams.get("status") as "ACTIVE" | "PAID_OFF" | "CANCELLED" | null;
    const overdueOnly = url.searchParams.get("overdueOnly") === "true";
    const clientName = url.searchParams.get("clientName")?.trim() || "";
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") || "20")));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where: Record<string, unknown> = { userId };
    if (status) where.status = status;

    if (overdueOnly) {
      where.status = "ACTIVE";
      where.installments = {
        some: {
          status: { in: ["PENDING", "OVERDUE"] },
          dueDate: { lt: today },
        },
      };
    }

    const loans = await db.loan.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, tier: true, whatsapp: true } },
        installments: { select: { status: true, dueDate: true, amount: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const filtered = clientName
      ? loans.filter((loan) =>
          loan.client.name.toLowerCase().includes(clientName.toLowerCase())
        )
      : loans;

    return NextResponse.json({
      total: filtered.length,
      loans: filtered.map((loan) => {
        const principal = decimalToNumber(loan.principal);
        const interestRate = decimalToNumber(loan.interestRate);
        const paidCount = loan.installments.filter((i) => i.status === "PAID").length;

        return {
          id: loan.id,
          cliente: loan.client.name,
          clienteId: loan.client.id,
          whatsapp: loan.client.whatsapp,
          tier: loan.client.tier,
          status: loan.status,
          data: loan.loanDate.toISOString(),
          principal,
          jurosPercentual: interestRate,
          parcelas: loan.installmentsCount,
          parcelasPagas: paidCount,
          intervalo: loan.interval,
        };
      }),
    });
  } catch (error) {
    console.error("[Agent API] loans:", error);
    return agentError(error instanceof Error ? error.message : "Erro interno");
  }
}

export async function POST(req: NextRequest) {
  if (!verifyAgentInternalAuth(req)) return agentUnauthorized();

  try {
    const userId = await resolveLoanOwnerUserId();
    const body = await req.json();
    const result = await createLoanForUser(userId, body);

    if ("error" in result && !("loan" in result)) {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: result.status }
      );
    }

    const { loan } = result;
    return NextResponse.json(
      {
        success: true,
        id: loan.id,
        cliente: loan.client.name,
        clienteId: loan.client.id,
        status: loan.status,
        principal: decimalToNumber(loan.principal),
        jurosPercentual: decimalToNumber(loan.interestRate),
        parcelas: loan.installmentsCount,
        intervalo: loan.interval,
        installments: loan.installments.map((inst) => ({
          numero: inst.number,
          vencimento: inst.dueDate.toISOString(),
          valor: decimalToNumber(inst.amount),
        })),
      },
      { status: result.status }
    );
  } catch (error) {
    console.error("[Agent API] create loan:", error);
    return agentError(error instanceof Error ? error.message : "Erro interno");
  }
}
