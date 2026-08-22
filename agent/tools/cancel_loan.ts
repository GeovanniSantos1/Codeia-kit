import { defineTool } from "eve/tools";
import { z } from "zod";
import { agentMutate } from "../lib/api-client";

export default defineTool({
  description: "Cancela um empréstimo ativo. Use com cautela — confirme com o operador antes.",
  inputSchema: z.object({
    loanId: z.string().min(1).describe("ID do empréstimo a cancelar"),
  }),
  async execute({ loanId }) {
    return agentMutate("DELETE", `/api/agent/loans/${loanId}`);
  },
});
