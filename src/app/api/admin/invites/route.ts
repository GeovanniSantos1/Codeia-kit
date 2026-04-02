import { NextRequest, NextResponse } from "next/server";
import { auth, createClerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin-utils";
import { withApiLogging } from "@/lib/logging/api";

export const runtime = "nodejs";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY as string });

const CreateInviteSchema = z.object({
  email: z.string().email("E-mail inválido"),
  planLabel: z.string().optional(),
  notes: z.string().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
  sendEmail: z.boolean().default(true),
});

async function handleGetInvites() {
  const { userId } = await auth();
  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invites = await db.accessInvite.findMany({
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const result = invites.map((inv) => ({
    ...inv,
    computedStatus:
      inv.status === "REVOKED"
        ? "REVOKED"
        : inv.expiresAt && inv.expiresAt < now
        ? "EXPIRED"
        : "ACTIVE",
  }));

  return NextResponse.json({ invites: result });
}

async function handleCreateInvite(req: NextRequest) {
  const { userId } = await auth();
  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = CreateInviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { email, planLabel, notes, expiresAt, sendEmail } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await db.accessInvite.findFirst({
    where: { email: normalizedEmail, status: "ACTIVE" },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Este e-mail já possui um convite ativo." },
      { status: 409 }
    );
  }

  const invite = await db.accessInvite.create({
    data: {
      email: normalizedEmail,
      planLabel: planLabel || null,
      notes: notes || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      grantedBy: userId,
      status: "ACTIVE",
    },
  });

  let emailStatus: "sent" | "already_registered" | "skipped" | "failed" = "skipped";
  let emailMessage: string | null = null;

  if (sendEmail) {
    try {
      const existingUsers = await clerk.users.getUserList({ emailAddress: [normalizedEmail] });

      if (existingUsers?.data?.length) {
        emailStatus = "already_registered";
        emailMessage = "Usuário já possui conta no sistema — acesso liberado sem reenvio de e-mail.";
      } else {
        await clerk.invitations.createInvitation({
          emailAddress: normalizedEmail,
          redirectUrl: process.env.NEXT_PUBLIC_APP_URL
            ? `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`
            : undefined,
        });
        emailStatus = "sent";
        emailMessage = "E-mail de convite enviado com sucesso via Clerk.";
      }
    } catch (err: unknown) {
      console.error("Clerk invitation error:", err);
      const e = err as { errors?: Array<{ message?: string }>; message?: string };
      emailStatus = "failed";
      emailMessage = e?.errors?.[0]?.message || e?.message || "Falha ao enviar e-mail de convite.";
    }
  }

  return NextResponse.json({ invite, emailStatus, emailMessage }, { status: 201 });
}

export const GET = withApiLogging(handleGetInvites, {
  method: "GET",
  route: "/api/admin/invites",
  feature: "admin",
});

export const POST = withApiLogging(handleCreateInvite, {
  method: "POST",
  route: "/api/admin/invites",
  feature: "admin",
});
