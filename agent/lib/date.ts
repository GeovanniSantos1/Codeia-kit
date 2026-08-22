const BRAZIL_TZ = "America/Sao_Paulo";

/** Data de hoje no fuso de São Paulo, formato yyyy-mm-dd. */
export function getTodayInBrazil(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: BRAZIL_TZ });
}

/** Data e hora formatadas para o operador (pt-BR). */
export function formatBrazilDateTime(date = new Date()): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TZ,
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatBrazilDate(date = new Date()): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
