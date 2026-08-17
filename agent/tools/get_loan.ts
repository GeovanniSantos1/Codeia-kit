import { defineTool } from "eve/tools";
import { z } from "zod";
import { db } from "@/lib/db";
import { decimalToNumber } from "@/lib/loans/calculations";
import { resolveLoanOwnerUserId } from "../lib/owner";

export default defineTool({
  description: "Busca detalhes completos de um empréstimo pelo ID, incluindo parcelas.",
  inputSchema: z.object({
    loanId: z.string().min(1),
  }),
  async execute({ loanId }) {
    const userId = await resolveLoanOwnerUserId();

    const loan = await db.loan.findFirst({
      where: { id: loanId, userId },
      include: {
        client: true,
        installments: { orderBy: { number: "asc" } },
      },
    });

    if (!loan) {
      return { found: false, message: "Empréstimo não encontrado." };
    }

    const principal = decimalToNumber(loan.principal);
    const interestRate = decimalToNumber(loan.interestRate);
    const totalDebt = principal * (1 + interestRate / 100);

    return {
      found: true,
      id: loan.id,
      cliente: loan.client.name,
      clienteWhatsapp: loan.client.whatsapp,
      status: loan.status,
      data: loan.loanDate.toISOString(),
      principal,
      jurosPercentual: interestRate,
      totalComJuros: totalDebt,
      parcelas: loan.installmentsCount,
      intervalo: loan.interval,
      multaPorDia: decimalToNumber(loan.penaltyPerDay),
      installments: loan.installments.map((inst) => ({
        numero: inst.number,
        vencimento: inst.dueDate.toISOString(),
        valor: decimalToNumber(inst.amount),
        pago: decimalToNumber(inst.paidAmount) || 0,
        multa: decimalToNumber(inst.penalty),
        status: inst.status,
      })),
    };
  },
});
