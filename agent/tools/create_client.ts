import { defineTool } from "eve/tools";
import { z } from "zod";
import { agentMutate } from "../lib/api-client";

export default defineTool({
  description: "Cadastra um novo cliente na plataforma.",
  inputSchema: z.object({
    name: z.string().min(1).describe("Nome completo do cliente"),
    whatsapp: z.string().optional().describe("Número de WhatsApp com DDD"),
    cpf: z.string().optional().describe("CPF do cliente"),
    address: z.string().optional().describe("Endereço"),
    pix: z.string().optional().describe("Chave PIX"),
    notes: z.string().optional().describe("Observações"),
  }),
  async execute(input) {
    return agentMutate("POST", "/api/agent/clients", input);
  },
});
