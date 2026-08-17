import { NextRequest, NextResponse } from "next/server";

export function verifyAgentInternalAuth(req: NextRequest): boolean {
  const secret = process.env.AGENT_INTERNAL_SECRET?.trim();
  if (!secret) return false;

  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;

  return auth.slice(7) === secret;
}

export function agentUnauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function agentError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}
