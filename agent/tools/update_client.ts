import { defineTool } from "eve/tools";
import { z } from "zod";
import { agentMutate } from "../lib/api-client";

export default defineTool({
  description: "Atualiza dados de um cliente existente.",
  inputSchema: z.object({
    clientId: z.string().min(1).describe("ID do cliente"),
    name: z.string().optional().describe("Nome"),
    whatsapp: z.string().optional().describe("WhatsApp"),
    cpf: z.string().optional().describe("CPF"),
    address: z.string().optional().describe("Endereço"),
    pix: z.string().optional().describe("Chave PIX"),
    notes: z.string().optional().describe("Observações"),
    tier: z
      .enum(["INICIANTE", "MAU_PAGADOR", "BOM_PAGADOR", "OURO", "BLOQUEADO"])
      .optional()
      .describe("Classificação do cliente"),
  }),
  async execute({ clientId, ...data }) {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    );
    return agentMutate("PUT", `/api/agent/clients/${clientId}`, payload);
  },
});
