import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserFromClerkId } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { calculatePenalty, calculateDaysOverdue, decimalToNumber } from "@/lib/loans/calculations";
import { InstallmentStatus } from "@prisma/client";
import { z } from "zod";

const payInstallmentSchema = z.object({
  installmentId: z.string().min(1),
  paidAmount: z.number().positive(),
  paidAt: z
    .string()
    .transform((s) => new Date(s))
    .optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const user = await getUserFromClerkId(clerkId);
    const { id } = await params;

    const loan = await db.loan.findFirst({
      where: { id, userId: user.id },
      include: { installments: { orderBy: { number: "asc" } } },
    });

    if (!loan) {
      return NextResponse.json({ error: "Empréstimo não encontrado" }, { status: 404 });
    }

    const today = new Date();
    const installments = loan.installments.map((inst) => {
      const amount = decimalToNumber(inst.amount);
      const daysOverdue = inst.status !== "PAID" ? calculateDaysOverdue(inst.dueDate, new Date(today)) : 0;
      const penalty =
        inst.status !== "PAID"
          ? calculatePenalty(amount, decimalToNumber(loan.penaltyPerDay), daysOverdue)
          : decimalToNumber(inst.penalty);

      return {
        ...inst,
        amount,
        penalty: Math.round(penalty * 100) / 100,
        daysOverdue,
        paidAmount: inst.paidAmount ? decimalToNumber(inst.paidAmount) : null,
      };
    });

    return NextResponse.json({ success: true, data: installments });
  } catch (error) {
    console.error("Error listing installments:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const user = await getUserFromClerkId(clerkId);
    const { id: loanId } = await params;
    const body = await req.json();
    const parsed = payInstallmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
    }

    const { installmentId, paidAmount, paidAt } = parsed.data;
    const paymentDate = paidAt || new Date();

    const loan = await db.loan.findFirst({
      where: { id: loanId, userId: user.id },
    });
    if (!loan) {
      return NextResponse.json({ error: "Empréstimo não encontrado" }, { status: 404 });
    }

    const installment = await db.installment.findFirst({
      where: { id: installmentId, loanId },
    });
    if (!installment) {
      return NextResponse.json({ error: "Parcela não encontrada" }, { status: 404 });
    }
    if (installment.status === InstallmentStatus.PAID) {
      return NextResponse.json({ error: "Parcela já paga" }, { status: 400 });
    }

    const amount = decimalToNumber(installment.amount);
    const daysOverdue = calculateDaysOverdue(installment.dueDate, paymentDate);
    const penalty = calculatePenalty(amount, decimalToNumber(loan.penaltyPerDay), daysOverdue);
    const totalDue = amount + Math.round(penalty * 100) / 100;
    
    // Valor já pago anteriormente (se houver pagamento parcial)
    const previouslyPaid = installment.paidAmount ? decimalToNumber(installment.paidAmount) : 0;
    const remainingBeforePayment = totalDue - previouslyPaid;
    
    // Validar que o pagamento não excede o valor restante (com tolerância de 1%)
    if (paidAmount > remainingBeforePayment * 1.01) {
      return NextResponse.json(
        { error: `Valor máximo para pagamento: R$ ${remainingBeforePayment.toFixed(2)}` },
        { status: 400 }
      );
    }

    // Calcular novo total pago
    const newTotalPaid = previouslyPaid + paidAmount;
    const isFullyPaid = newTotalPaid >= totalDue * 0.99; // Tolerância de 1%
    const remainingAmount = Math.max(0, totalDue - newTotalPaid);
    const paymentPercentage = totalDue > 0 ? (newTotalPaid / totalDue) * 100 : 0;

    const result = await db.$transaction(async (tx) => {
      const updatedInstallment = await tx.installment.update({
        where: { id: installmentId },
        data: {
          status: isFullyPaid ? InstallmentStatus.PAID : InstallmentStatus.PARTIALLY_PAID,
          paidAt: isFullyPaid ? paymentDate : installment.paidAt,
          paidAmount: newTotalPaid,
          penalty: Math.round(penalty * 100) / 100,
        },
      });

      await tx.transaction.create({
        data: {
          userId: user.id,
          clientId: loan.clientId,
          loanId,
          type: "ENTRADA",
          amount: paidAmount,
          date: paymentDate,
          notes: `Pagamento ${isFullyPaid ? 'parcela' : 'parcial'} ${installment.number}/${loan.installmentsCount}`,
        },
      });

      const remainingCount = await tx.installment.count({
        where: { loanId, status: { not: InstallmentStatus.PAID } },
      });

      if (remainingCount === 0) {
        await tx.loan.update({
          where: { id: loanId },
          data: { status: "PAID_OFF" },
        });
      }

      return { 
        updatedInstallment, 
        loanPaidOff: remainingCount === 0,
        isFullyPaid,
        remainingAmount,
        paymentPercentage
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        ...result.updatedInstallment,
        amount: decimalToNumber(result.updatedInstallment.amount),
        paidAmount: result.updatedInstallment.paidAmount ? decimalToNumber(result.updatedInstallment.paidAmount) : null,
        penalty: decimalToNumber(result.updatedInstallment.penalty),
      },
      loanPaidOff: result.loanPaidOff,
      isFullyPaid: result.isFullyPaid,
      remainingAmount: result.remainingAmount,
      paymentPercentage: Math.round(result.paymentPercentage * 100) / 100,
    });
  } catch (error: any) {
    console.error("Error paying installment:", error);
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack,
    });
    return NextResponse.json({ error: "Erro interno: " + (error?.message || "Unknown error") }, { status: 500 });
  }
}
