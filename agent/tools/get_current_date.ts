import { defineTool } from "eve/tools";
import { z } from "zod";
import { formatBrazilDate, formatBrazilDateTime, getTodayInBrazil } from "../lib/date";

export default defineTool({
  description:
    "Retorna a data e hora atuais no fuso horário de Brasília. Use quando precisar confirmar em que dia estamos.",
  inputSchema: z.object({}),
  async execute() {
    const iso = getTodayInBrazil();
    return {
      hoje: formatBrazilDate(),
      dataHora: formatBrazilDateTime(),
      iso,
      fuso: "America/Sao_Paulo",
    };
  },
});
