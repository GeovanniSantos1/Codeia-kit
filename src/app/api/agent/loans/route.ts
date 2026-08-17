import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decimalToNumber } from "@/lib/loans/calculations";
import { agentError, agentUnauthorized, verifyAgentInternalAuth } from "@/lib/agent/auth";
import { resolveLoanOwnerUserId } from "@/lib/agent/owner";

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
  return GET(req);
}
