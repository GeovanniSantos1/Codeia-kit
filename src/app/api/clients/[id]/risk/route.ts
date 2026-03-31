import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromClerkId } from "@/lib/auth-utils";
import { calculateRiskScore } from "@/lib/loans/risk-score";

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await getUserFromClerkId(clerkId);
    const { id } = await ctx.params;

    const client = await db.client.findFirst({
      where: { id, userId: user.id },
      include: {
        loans: {
          include: {
            installments: {
              select: { status: true, amount: true },
            },
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    let totalActiveDebt = 0;
    let totalPaidInstallments = 0;
    let totalOverdueInstallments = 0;

    for (const loan of client.loans) {
      const isActive = loan.status === "ACTIVE";
      for (const inst of loan.installments) {
        if (inst.status === "PAID") {
          totalPaidInstallments++;
        } else if (inst.status === "OVERDUE") {
          totalOverdueInstallments++;
          if (isActive) totalActiveDebt += Number(inst.amount);
        } else if (inst.status === "PENDING" || inst.status === "PARTIALLY_PAID") {
          if (isActive) totalActiveDebt += Number(inst.amount);
        }
      }
    }

    const result = calculateRiskScore({
      creditBureau: client.creditBureau,
      employmentType: client.employmentType,
      monthlyIncome: client.monthlyIncome ? Number(client.monthlyIncome) : null,
      dependents: client.dependents,
      bankType: client.bankType,
      totalActiveDebt,
      totalPaidInstallments,
      totalOverdueInstallments,
    });

    const updated = await db.client.updateMany({
      where: { id, userId: user.id },
      data: {
        riskScore: result.score,
        riskLevel: result.level,
      },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      score: result.score,
      level: result.level,
      breakdown: result.breakdown,
    });
  } catch (error) {
    console.error("Failed to calculate risk score:", error);
    return NextResponse.json({ error: "Erro ao calcular score de risco" }, { status: 500 });
  }
}
