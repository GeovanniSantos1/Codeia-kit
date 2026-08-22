import { NextRequest, NextResponse } from "next/server";
import { agentError, agentUnauthorized, verifyAgentInternalAuth } from "@/lib/agent/auth";
import { resolveLoanOwnerUserId } from "@/lib/agent/owner";
import { createClientForUser } from "@/lib/agent/services";

export async function POST(req: NextRequest) {
  if (!verifyAgentInternalAuth(req)) return agentUnauthorized();

  try {
    const userId = await resolveLoanOwnerUserId();
    const body = await req.json();
    const result = await createClientForUser(userId, body);

    if ("error" in result && !("client" in result)) {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: result.status }
      );
    }

    const { client } = result;
    return NextResponse.json(
      {
        success: true,
        id: client.id,
        nome: client.name,
        whatsapp: client.whatsapp,
        cpf: client.cpf,
        tier: client.tier,
      },
      { status: result.status }
    );
  } catch (error) {
    console.error("[Agent API] create client:", error);
    return agentError(error instanceof Error ? error.message : "Erro interno");
  }
}
