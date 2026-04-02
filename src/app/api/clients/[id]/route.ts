import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { getUserFromClerkId } from "@/lib/auth-utils";
import { withApiLogging } from "@/lib/logging/api";

const UpdateClientSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  whatsapp: z.string().max(30).optional().nullable(),
  cpf: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  motherName: z.string().max(200).optional().nullable(),
  pix: z.string().max(200).optional().nullable(),
  bank: z.string().max(100).optional().nullable(),
  agency: z.string().max(20).optional().nullable(),
  account: z.string().max(30).optional().nullable(),
  reserve: z.number().optional().nullable(),
  line: z.number().int().optional().nullable(),
  notes: z.string().optional().nullable(),
  creditBureau: z.enum(["CLEAN", "RESTRICTED", "NEGATIVE"]).optional().nullable(),
  employmentType: z.enum(["CLT", "PUBLIC", "SELF_EMPLOYED", "RETIRED", "UNEMPLOYED"]).optional().nullable(),
  monthlyIncome: z.number().min(0).optional().nullable(),
  dependents: z.number().int().min(0).max(20).optional().nullable(),
  bankType: z.enum(["LARGE_BANK", "DIGITAL_BANK", "NO_BANK"]).optional().nullable(),
  creditNotes: z.string().optional().nullable(),
  tier: z.enum(["INICIANTE", "MAU_PAGADOR", "BOM_PAGADOR", "OURO", "BLOQUEADO"]).optional().nullable(),
});

async function handleClientGet(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await getUserFromClerkId(clerkId);
    const { id } = await ctx.params;

    const client = await db.client.findFirst({
      where: { id, userId: user.id },
      include: {
        loans: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (error) {
    console.error("Failed to fetch client:", error);
    return NextResponse.json({ error: "Falha ao buscar cliente" }, { status: 500 });
  }
}

async function handleClientUpdate(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await getUserFromClerkId(clerkId);
    const { id } = await ctx.params;

    const existing = await db.client.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const body = await request.json().catch(() => null);
    const parsed = UpdateClientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const client = await db.client.update({
      where: { id },
      data: {
        name: data.name ?? existing.name,
        whatsapp: data.whatsapp !== undefined ? data.whatsapp : existing.whatsapp,
        cpf: data.cpf !== undefined ? data.cpf : existing.cpf,
        address: data.address !== undefined ? data.address : existing.address,
        motherName: data.motherName !== undefined ? data.motherName : existing.motherName,
        pix: data.pix !== undefined ? data.pix : existing.pix,
        bank: data.bank !== undefined ? data.bank : existing.bank,
        agency: data.agency !== undefined ? data.agency : existing.agency,
        account: data.account !== undefined ? data.account : existing.account,
        reserve: data.reserve !== undefined ? data.reserve : existing.reserve,
        line: data.line !== undefined ? data.line : existing.line,
        notes: data.notes !== undefined ? data.notes : existing.notes,
        creditBureau: data.creditBureau !== undefined ? data.creditBureau : existing.creditBureau,
        employmentType: data.employmentType !== undefined ? data.employmentType : existing.employmentType,
        monthlyIncome: data.monthlyIncome !== undefined ? data.monthlyIncome : existing.monthlyIncome,
        dependents: data.dependents !== undefined ? data.dependents : existing.dependents,
        bankType: data.bankType !== undefined ? data.bankType : existing.bankType,
        creditNotes: data.creditNotes !== undefined ? data.creditNotes : existing.creditNotes,
        tier: data.tier !== undefined ? data.tier : existing.tier,
      },
    });

    return NextResponse.json({ client });
  } catch (error) {
    console.error("Failed to update client:", error);
    return NextResponse.json({ error: "Falha ao atualizar cliente" }, { status: 500 });
  }
}

async function handleClientDelete(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await getUserFromClerkId(clerkId);
    const { id } = await ctx.params;

    const existing = await db.client.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    await db.client.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete client:", error);
    return NextResponse.json({ error: "Falha ao excluir cliente" }, { status: 500 });
  }
}

export const GET = withApiLogging(handleClientGet, {
  method: "GET",
  route: "/api/clients/[id]",
  feature: "clients",
});

export const PUT = withApiLogging(handleClientUpdate, {
  method: "PUT",
  route: "/api/clients/[id]",
  feature: "clients",
});

export const PATCH = withApiLogging(handleClientUpdate, {
  method: "PATCH",
  route: "/api/clients/[id]",
  feature: "clients",
});

export const DELETE = withApiLogging(handleClientDelete, {
  method: "DELETE",
  route: "/api/clients/[id]",
  feature: "clients",
});
