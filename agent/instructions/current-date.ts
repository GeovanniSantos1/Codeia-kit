import { defineDynamic, defineInstructions } from "eve/instructions";
import { formatBrazilDate, formatBrazilDateTime, getTodayInBrazil } from "../lib/date";

export default defineDynamic({
  events: {
    "turn.started": () => {
      const hoje = getTodayInBrazil();
      const dataHora = formatBrazilDateTime();
      const dataFormatada = formatBrazilDate();

      return defineInstructions({
        content: [
          "## Data e hora atuais",
          "",
          `Hoje é **${dataFormatada}** (${dataHora}, horário de Brasília).`,
          `Use esta data como referência para "hoje", "amanhã", vencimentos, cobranças e cálculos de prazo.`,
          `Formato ISO de hoje: \`${hoje}\`.`,
          "",
          "Regras de data:",
          "- Não invente nem estime a data atual — use sempre os valores acima.",
          "- Ao criar empréstimos, **não passe loanDate** a menos que o operador peça uma data específica diferente de hoje (o sistema usa hoje automaticamente).",
          "- Para \"daqui X dias\", use interval=CUSTOM, customIntervalDays=X e installmentsCount=1.",
          "- Para pagamentos, não passe paidAt a menos que o operador informe outra data (padrão: hoje).",
        ].join("\n"),
      });
    },
  },
});
