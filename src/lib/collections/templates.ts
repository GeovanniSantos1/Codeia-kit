export type NotificationTemplateType =
  | "PREVENTIVE_7D"
  | "PREVENTIVE_3D"
  | "PREVENTIVE_1D"
  | "REACTIVE_1_3D"
  | "REACTIVE_4_7D"
  | "REACTIVE_8D_PLUS";

export type TemplateVars = {
  nome: string;
  valor: string;
  vencimento: string;
  diasAtraso?: number;
  diasRestantes?: number;
};

const TEMPLATES: Record<NotificationTemplateType, string> = {
  PREVENTIVE_7D:
    "Olá {nome}! Tudo bem? 😊 Passando para lembrar que a parcela do seu empréstimo no valor de {valor} vence em {diasRestantes} dias, no dia {vencimento}. Se precisar de algo, é só me chamar!",

  PREVENTIVE_3D:
    "Olá {nome}! Lembrete rápido: a parcela do seu empréstimo de {valor} vence em {diasRestantes} dias, no dia {vencimento}. Já se programe para não perder o prazo! Qualquer dúvida, estou aqui. 👍",

  PREVENTIVE_1D:
    "Olá {nome}! ⚠️ Aviso importante: a parcela do seu empréstimo de {valor} vence AMANHÃ, {vencimento}. Para evitar multa por atraso, por favor realize o pagamento até lá. Conte comigo para qualquer dúvida!",

  REACTIVE_1_3D:
    "Olá {nome}! Identifiquei que a parcela do seu empréstimo de {valor} venceu há {diasAtraso} dia(s) (vencimento: {vencimento}). Por favor, regularize o quanto antes para evitar acúmulo de multa. Estou à disposição!",

  REACTIVE_4_7D:
    "Olá {nome}! A parcela do seu empréstimo de {valor} está em atraso há {diasAtraso} dias (vencimento: {vencimento}). As multas já estão sendo aplicadas. Preciso que entre em contato urgente para resolvermos essa situação. 🙏",

  REACTIVE_8D_PLUS:
    "Olá {nome}! URGENTE: A parcela do seu empréstimo de {valor} está em atraso há {diasAtraso} dias (vencimento: {vencimento}). Essa situação precisa ser regularizada imediatamente. Entre em contato agora para evitar medidas adicionais. Aguardo seu retorno.",
};

export function buildMessage(type: NotificationTemplateType, vars: TemplateVars): string {
  let text = TEMPLATES[type];
  text = text.replace(/\{nome\}/g, vars.nome);
  text = text.replace(/\{valor\}/g, vars.valor);
  text = text.replace(/\{vencimento\}/g, vars.vencimento);
  if (vars.diasAtraso !== undefined) {
    text = text.replace(/\{diasAtraso\}/g, String(vars.diasAtraso));
  }
  if (vars.diasRestantes !== undefined) {
    text = text.replace(/\{diasRestantes\}/g, String(vars.diasRestantes));
  }
  return text;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const full = cleaned.startsWith("55") ? cleaned : `55${cleaned}`;
  return `https://wa.me/${full}?text=${encodeURIComponent(message)}`;
}

export const TEMPLATE_LABELS: Record<NotificationTemplateType, string> = {
  PREVENTIVE_7D: "Preventiva — 7 dias",
  PREVENTIVE_3D: "Preventiva — 3 dias",
  PREVENTIVE_1D: "Preventiva — 24h",
  REACTIVE_1_3D: "Reativa — 1 a 3 dias",
  REACTIVE_4_7D: "Reativa — 4 a 7 dias",
  REACTIVE_8D_PLUS: "Reativa — 8+ dias",
};
