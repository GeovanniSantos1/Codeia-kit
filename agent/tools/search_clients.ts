import { defineTool } from "eve/tools";
import { z } from "zod";
import { db } from "@/lib/db";
import { decimalToNumber } from "@/lib/loans/calculations";
import { resolveLoanOwnerUserId } from "../lib/owner";

export default defineTool({
  description: "Busca clientes pelo nome e retorna empréstimos ativos associados.",
  inputSchema: z.object({
    query: z.string().min(1),
    limit: z.number().int().min(1).max(30).optional(),
  }),
  async execute({ query, limit = 10 }) {
    const userId = await resolveLoanOwnerUserId();

    const clients = await db.client.findMany({
      where: {
        userId,
        name: { contains: query, mode: "insensitive" },
      },
      include: {
        loans: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
            principal: true,
            status: true,
            loanDate: true,
            installmentsCount: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      take: limit,
      orderBy: { name: "asc" },
    });

    return {
      total: clients.length,
      clientes: clients.map((client) => ({
        id: client.id,
        nome: client.name,
        whatsapp: client.whatsapp,
        tier: client.tier,
        emprestimosAtivos: client.loans.map((loan) => ({
          id: loan.id,
          principal: decimalToNumber(loan.principal),
          status: loan.status,
          data: loan.loanDate.toISOString(),
          parcelas: loan.installmentsCount,
        })),
      })),
    };
  },
});
