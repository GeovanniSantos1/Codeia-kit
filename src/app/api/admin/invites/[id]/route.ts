import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin-utils";
import { withApiLogging } from "@/lib/logging/api";

async function handleRevokeInvite(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const invite = await db.accessInvite.findUnique({ where: { id } });
  if (!invite) {
    return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
  }
  if (invite.status === "REVOKED") {
    return NextResponse.json({ error: "Convite já foi revogado" }, { status: 409 });
  }

  const updated = await db.accessInvite.update({
    where: { id },
    data: {
      status: "REVOKED",
      revokedBy: userId,
      revokedAt: new Date(),
    },
  });

  return NextResponse.json({ invite: updated });
}

async function handleDeleteInvite(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const invite = await db.accessInvite.findUnique({ where: { id } });
  if (!invite) {
    return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
  }

  await db.accessInvite.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

export const PATCH = withApiLogging(handleRevokeInvite, {
  method: "PATCH",
  route: "/api/admin/invites/[id]",
  feature: "admin",
});

export const DELETE = withApiLogging(handleDeleteInvite, {
  method: "DELETE",
  route: "/api/admin/invites/[id]",
  feature: "admin",
});
