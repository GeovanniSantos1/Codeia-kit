import { NextRequest, NextResponse } from "next/server";
import { agentError, agentUnauthorized, verifyAgentInternalAuth } from "@/lib/agent/auth";
import { resolveLoanOwnerUserId } from "@/lib/agent/owner";
import { updateClientForUser } from "@/lib/agent/services";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAgentInternalAuth(req)) return agentUnauthorized();

  try {
    const { id } = await params;
    const userId = await resolveLoanOwnerUserId();
    const body = await req.json();
    const result = await updateClientForUser(userId, id, body);

    if ("error" in result && !("client" in result)) {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: result.status }
      );
    }

    const { client } = result;
    return NextResponse.json({
      success: true,
      id: client.id,
      nome: client.name,
      whatsapp: client.whatsapp,
      cpf: client.cpf,
      tier: client.tier,
    });
  } catch (error) {
    console.error("[Agent API] update client:", error);
    return agentError(error instanceof Error ? error.message : "Erro interno");
  }
}
