import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { agentError, agentUnauthorized, verifyAgentInternalAuth } from "@/lib/agent/auth";
import { resolveLoanOwnerUserId } from "@/lib/agent/owner";
import {
  VALID_NOTIFICATION_TYPES,
  validateNotificationTypeForDueDate,
} from "@/lib/agent/collections";

const logSchema = z.object({
  installmentId: z.string().min(1),
  type: z.enum(VALID_NOTIFICATION_TYPES),
});

export async function POST(req: NextRequest) {
  if (!verifyAgentInternalAuth(req)) return agentUnauthorized();

  try {
    const userId = await resolveLoanOwnerUserId();
    const body = await req.json();
    const parsed = logSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { installmentId, type } = parsed.data;

    const installment = await db.installment.findFirst({
      where: { id: installmentId, loan: { userId } },
    });

    if (!installment) {
      return NextResponse.json({ error: "Parcela não encontrada" }, { status: 404 });
    }

    const validationError = validateNotificationTypeForDueDate(type, installment.dueDate);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const log = await db.notificationLog.create({
      data: {
        userId,
        installmentId,
        type,
        channel: "WHATSAPP",
      },
    });

    return NextResponse.json({
      success: true,
      id: log.id,
      installmentId: log.installmentId,
      type: log.type,
      enviadoEm: log.sentAt.toISOString(),
    });
  } catch (error) {
    console.error("[Agent API] collection log:", error);
    return agentError(error instanceof Error ? error.message : "Erro interno");
  }
}
