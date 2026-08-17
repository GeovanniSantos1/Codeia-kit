import { defineTool } from "eve/tools";
import { z } from "zod";
import { agentFetch } from "../lib/api-client";

export default defineTool({
  description: "Busca detalhes completos de um empréstimo pelo ID, incluindo parcelas.",
  inputSchema: z.object({
    loanId: z.string().min(1),
  }),
  async execute({ loanId }) {
    return agentFetch(`/api/agent/loans/${loanId}`);
  },
});
