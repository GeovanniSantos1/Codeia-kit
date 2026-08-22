import { defineTool } from "eve/tools";
import { z } from "zod";
import { agentMutate } from "../lib/api-client";

export default defineTool({
  description:
    "Gera mensagem de cobrança (preventiva ou reativa) para uma parcela e retorna o link do WhatsApp pronto para envio.",
  inputSchema: z.object({
    installmentId: z.string().min(1).describe("ID da parcela"),
    type: z
      .enum([
        "PREVENTIVE_7D",
        "PREVENTIVE_3D",
        "PREVENTIVE_1D",
        "REACTIVE_1_3D",
        "REACTIVE_4_7D",
        "REACTIVE_8D_PLUS",
      ])
      .optional()
      .describe("Tipo de template. Se omitido, é inferido automaticamente pelo vencimento"),
  }),
  async execute({ installmentId, type }) {
    return agentMutate("POST", "/api/agent/collections/message", {
      installmentId,
      ...(type ? { type } : {}),
    });
  },
});
