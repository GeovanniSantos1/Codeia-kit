import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserFromClerkId } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { generateInstallments } from "@/lib/loans/calculations";
import { z } from "zod";

const createLoanSchema = z.object({
  clientId: z.string().min(1),
  loanDate: z.string().transform((s) => new Date(s)),
  principal: z.number().positive(),
  interestRate: z.number().min(0),
  installmentsCount: z.number().int().min(1).max(30),
  interval: z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "CUSTOM"]),
  customIntervalDays: z.number().int().min(1).max(365).optional(),
  penaltyPerDay: z.number().min(0).default(0),
}).refine(
  (data) => data.interval !== "CUSTOM" || (data.customIntervalDays != null && data.customIntervalDays > 0),
  { message: "customIntervalDays é obrigatório para intervalo personalizado", path: ["customIntervalDays"] }
);

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const user = await getUserFromClerkId(clerkId);
    const url = new URL(req.url);
    const clientId = url.searchParams.get("clientId");
    const status = url.searchParams.get("status");
    const overdue = url.searchParams.get("overdue");
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || "20")));

    const where: Record<string, unknown> = { userId: user.id };
    if (clientId) where.clientId = clientId;
    if (status) where.status = status;

    if (overdue === "true") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      where.status = "ACTIVE";
      where.installments = {
        some: {
          status: { in: ["PENDING", "OVERDUE"] },
          dueDate: { lt: today },
        },
      };
    }

    const [loans, total] = await Promise.all([
      db.loan.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, whatsapp: true } },
          installments: { orderBy: { number: "asc" } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.loan.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: loans,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error listing loans:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const user = await getUserFromClerkId(clerkId);
    const body = await req.json();
    const parsed = createLoanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

    const client = await db.client.findFirst({
      where: { id: data.clientId, userId: user.id },
    });
    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const installments = generateInstallments({
      loanDate: data.loanDate,
      principal: data.principal,
      interestRate: data.interestRate,
      installmentsCount: data.installmentsCount,
      interval: data.interval,
      customIntervalDays: data.customIntervalDays,
    });

    const loan = await db.loan.create({
      data: {
        userId: user.id,
        clientId: data.clientId,
        loanDate: data.loanDate,
        principal: data.principal,
        interestRate: data.interestRate,
        installmentsCount: data.installmentsCount,
        interval: data.interval,
        customIntervalDays: data.customIntervalDays ?? null,
        penaltyPerDay: data.penaltyPerDay,
        installments: {
          create: installments.map((inst) => ({
            number: inst.number,
            dueDate: inst.dueDate,
            amount: inst.amount,
          })),
        },
      },
      include: {
        installments: { orderBy: { number: "asc" } },
        client: { select: { id: true, name: true } },
      },
    });

    await db.transaction.create({
      data: {
        userId: user.id,
        clientId: data.clientId,
        loanId: loan.id,
        type: "SAIDA",
        amount: data.principal,
        date: data.loanDate,
        notes: `Empréstimo concedido para ${client.name}`,
      },
    });

    return NextResponse.json({ success: true, data: loan }, { status: 201 });
  } catch (error) {
    console.error("Error creating loan:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
