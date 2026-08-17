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
    const query = url.searchParams.get("q")?.trim();
    const limit = Math.min(30, Math.max(1, Number(url.searchParams.get("limit") || "10")));

    if (!query) {
      return agentError("Parâmetro q é obrigatório.", 400);
    }

    const clients = await db.client.findMany({
      where: {
        userId,
        name: { contains: query, mode: "insensitive" },
      },
      include: {
        loans: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
            principal: true,
            status: true,
            loanDate: true,
            installmentsCount: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      take: limit,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      total: clients.length,
      clientes: clients.map((client) => ({
        id: client.id,
        nome: client.name,
        whatsapp: client.whatsapp,
        tier: client.tier,
        emprestimosAtivos: client.loans.map((loan) => ({
          id: loan.id,
          principal: decimalToNumber(loan.principal),
          status: loan.status,
          data: loan.loanDate.toISOString(),
          parcelas: loan.installmentsCount,
        })),
      })),
    });
  } catch (error) {
    console.error("[Agent API] clients search:", error);
    return agentError(error instanceof Error ? error.message : "Erro interno");
  }
}
