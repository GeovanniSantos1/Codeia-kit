import { defineTool } from "eve/tools";
import { z } from "zod";
import { agentMutate } from "../lib/api-client";

export default defineTool({
  description:
    "Registra que uma cobrança foi enviada ao cliente via WhatsApp. Use após o operador confirmar o envio.",
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
      .describe("Tipo de notificação enviada"),
  }),
  async execute({ installmentId, type }) {
    return agentMutate("POST", "/api/agent/collections/log", { installmentId, type });
  },
});
