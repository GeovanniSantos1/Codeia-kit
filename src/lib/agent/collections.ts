import {
  buildMessage,
  buildWhatsAppUrl,
  type NotificationTemplateType,
} from "@/lib/collections/templates";
import { formatCurrency, formatDate } from "@/lib/loans/calculations";

export const VALID_NOTIFICATION_TYPES = [
  "PREVENTIVE_7D",
  "PREVENTIVE_3D",
  "PREVENTIVE_1D",
  "REACTIVE_1_3D",
  "REACTIVE_4_7D",
  "REACTIVE_8D_PLUS",
] as const;

export type ValidNotificationType = (typeof VALID_NOTIFICATION_TYPES)[number];

export function inferNotificationType(dueDate: Date): NotificationTemplateType | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays >= 6 && diffDays <= 7) return "PREVENTIVE_7D";
  if (diffDays >= 2 && diffDays <= 3) return "PREVENTIVE_3D";
  if (diffDays >= 0 && diffDays <= 1) return "PREVENTIVE_1D";
  if (diffDays >= -3 && diffDays <= -1) return "REACTIVE_1_3D";
  if (diffDays >= -7 && diffDays <= -4) return "REACTIVE_4_7D";
  if (diffDays <= -8) return "REACTIVE_8D_PLUS";

  return null;
}

export function buildCollectionMessage(params: {
  clientName: string;
  clientWhatsapp: string;
  amount: number;
  dueDate: Date;
  type?: NotificationTemplateType;
}) {
  const type = params.type ?? inferNotificationType(params.dueDate);
  if (!type) {
    throw new Error("Não foi possível determinar o tipo de cobrança para esta parcela.");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(params.dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const message = buildMessage(type, {
    nome: params.clientName,
    valor: formatCurrency(params.amount),
    vencimento: formatDate(params.dueDate),
    diasAtraso: diffDays < 0 ? Math.abs(diffDays) : undefined,
    diasRestantes: diffDays >= 0 ? diffDays : undefined,
  });

  const whatsappUrl = buildWhatsAppUrl(params.clientWhatsapp, message);

  return { type, message, whatsappUrl };
}

export function validateNotificationTypeForDueDate(
  type: ValidNotificationType,
  dueDate: Date
): string | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const isPreventive = type.startsWith("PREVENTIVE_");
  const isReactive = type.startsWith("REACTIVE_");

  if (isPreventive && diffDays < 0) {
    return "Não é possível usar tipo preventivo para parcela vencida.";
  }
  if (isReactive && diffDays >= 0) {
    return "Não é possível usar tipo reativo para parcela não vencida.";
  }
  if (type === "PREVENTIVE_1D" && (diffDays < 0 || diffDays > 1)) {
    return "Tipo PREVENTIVE_1D requer vencimento em 0–1 dias.";
  }
  if (type === "PREVENTIVE_3D" && (diffDays < 2 || diffDays > 3)) {
    return "Tipo PREVENTIVE_3D requer vencimento em 2–3 dias.";
  }
  if (type === "PREVENTIVE_7D" && (diffDays < 6 || diffDays > 7)) {
    return "Tipo PREVENTIVE_7D requer vencimento em 6–7 dias.";
  }
  if (type === "REACTIVE_1_3D" && (diffDays > -1 || diffDays < -3)) {
    return "Tipo REACTIVE_1_3D requer parcela 1–3 dias em atraso.";
  }
  if (type === "REACTIVE_4_7D" && (diffDays > -4 || diffDays < -7)) {
    return "Tipo REACTIVE_4_7D requer parcela 4–7 dias em atraso.";
  }
  if (type === "REACTIVE_8D_PLUS" && diffDays > -8) {
    return "Tipo REACTIVE_8D_PLUS requer parcela 8+ dias em atraso.";
  }

  return null;
}
