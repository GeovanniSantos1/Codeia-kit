import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { decimalToNumber } from "@/lib/loans/calculations";
import { TEMPLATE_LABELS, type NotificationTemplateType } from "@/lib/collections/templates";
import { agentError, agentUnauthorized, verifyAgentInternalAuth } from "@/lib/agent/auth";
import { resolveLoanOwnerUserId } from "@/lib/agent/owner";
import { buildCollectionMessage } from "@/lib/agent/collections";

const messageSchema = z.object({
  installmentId: z.string().min(1),
  type: z
    .enum([
      "PREVENTIVE_7D",
      "PREVENTIVE_3D",
      "PREVENTIVE_1D",
      "REACTIVE_1_3D",
      "REACTIVE_4_7D",
      "REACTIVE_8D_PLUS",
    ])
    .optional(),
});

export async function POST(req: NextRequest) {
  if (!verifyAgentInternalAuth(req)) return agentUnauthorized();

  try {
    const userId = await resolveLoanOwnerUserId();
    const body = await req.json();
    const parsed = messageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { installmentId, type } = parsed.data;

    const installment = await db.installment.findFirst({
      where: { id: installmentId, loan: { userId } },
      include: { loan: { include: { client: true } } },
    });

    if (!installment) {
      return NextResponse.json({ error: "Parcela não encontrada" }, { status: 404 });
    }

    const client = installment.loan.client;
    if (!client.whatsapp) {
      return NextResponse.json(
        { error: "Cliente não possui WhatsApp cadastrado" },
        { status: 400 }
      );
    }

    const amount = decimalToNumber(installment.amount);
    const result = buildCollectionMessage({
      clientName: client.name,
      clientWhatsapp: client.whatsapp,
      amount,
      dueDate: installment.dueDate,
      type: type as NotificationTemplateType | undefined,
    });

    return NextResponse.json({
      success: true,
      installmentId,
      cliente: client.name,
      whatsapp: client.whatsapp,
      tipo: result.type,
      tipoLabel: TEMPLATE_LABELS[result.type],
      mensagem: result.message,
      whatsappUrl: result.whatsappUrl,
    });
  } catch (error) {
    console.error("[Agent API] collection message:", error);
    return agentError(error instanceof Error ? error.message : "Erro interno");
  }
}
