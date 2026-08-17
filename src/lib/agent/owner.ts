import { db } from "@/lib/db";

let cachedOwnerUserId: string | null = null;

export async function resolveLoanOwnerUserId(): Promise<string> {
  if (cachedOwnerUserId) return cachedOwnerUserId;

  const explicitId = process.env.EVE_AGENT_USER_ID?.trim();
  if (explicitId) {
    const user = await db.user.findUnique({ where: { id: explicitId } });
    if (!user) throw new Error("EVE_AGENT_USER_ID não corresponde a um usuário válido.");
    cachedOwnerUserId = user.id;
    return user.id;
  }

  const adminEmail =
    process.env.EVE_AGENT_OWNER_EMAIL?.trim() ||
    process.env.ADMIN_EMAILS?.split(",")[0]?.trim();

  if (adminEmail) {
    const user = await db.user.findFirst({
      where: { email: { equals: adminEmail, mode: "insensitive" } },
    });
    if (user) {
      cachedOwnerUserId = user.id;
      return user.id;
    }
  }

  const fallback = await db.user.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (!fallback) {
    throw new Error(
      "Nenhum usuário encontrado. Configure EVE_AGENT_USER_ID ou ADMIN_EMAILS."
    );
  }

  cachedOwnerUserId = fallback.id;
  return fallback.id;
}
