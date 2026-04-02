import { NextRequest, NextResponse } from "next/server";
import { auth, createClerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin-utils";
import { withApiLogging } from "@/lib/logging/api";

export const runtime = "nodejs";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY as string });

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

async function handleResendInvite(
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
    return NextResponse.json({ error: "Não é possível reenviar um convite revogado." }, { status: 409 });
  }

  const now = new Date();
  if (invite.expiresAt && invite.expiresAt < now) {
    return NextResponse.json({ error: "Não é possível reenviar um convite expirado." }, { status: 409 });
  }

  try {
    const existingUsers = await clerk.users.getUserList({ emailAddress: [invite.email] });

    if (existingUsers?.data?.length) {
      return NextResponse.json({
        emailStatus: "already_registered",
        message: "Este e-mail já possui conta cadastrada. O acesso já está liberado e nenhum e-mail foi enviado.",
      });
    }

    await clerk.invitations.createInvitation({
      emailAddress: invite.email,
      redirectUrl: process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`
        : undefined,
    });

    return NextResponse.json({
      emailStatus: "sent",
      message: "E-mail de convite reenviado com sucesso.",
    });
  } catch (err: unknown) {
    console.error("Clerk resend invitation error:", err);
    const e = err as { errors?: Array<{ message?: string }>; message?: string };
    const message = e?.errors?.[0]?.message || e?.message || "Falha ao reenviar e-mail.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export const PATCH = withApiLogging(handleRevokeInvite, {
  method: "PATCH",
  route: "/api/admin/invites/[id]",
  feature: "admin",
});

export const POST = withApiLogging(handleResendInvite, {
  method: "POST",
  route: "/api/admin/invites/[id]",
  feature: "admin",
});

export const DELETE = withApiLogging(handleDeleteInvite, {
  method: "DELETE",
  route: "/api/admin/invites/[id]",
  feature: "admin",
});
