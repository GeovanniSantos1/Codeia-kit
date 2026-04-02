export type ClientTier = "INICIANTE" | "MAU_PAGADOR" | "BOM_PAGADOR" | "OURO" | "BLOQUEADO";

export const CLIENT_TIER_LABELS: Record<ClientTier, string> = {
  INICIANTE:   "Iniciante",
  MAU_PAGADOR: "Mau Pagador",
  BOM_PAGADOR: "Bom Pagador",
  OURO:        "Cliente Ouro",
  BLOQUEADO:   "Fumo — Nunca Mais",
};

export const CLIENT_TIER_EMOJI: Record<ClientTier, string> = {
  INICIANTE:   "🆕",
  MAU_PAGADOR: "⚠️",
  BOM_PAGADOR: "✅",
  OURO:        "⭐",
  BLOQUEADO:   "🚫",
};

export const CLIENT_TIER_DESCRIPTION: Record<ClientTier, string> = {
  INICIANTE:   "Novo cliente, sem histórico na plataforma.",
  MAU_PAGADOR: "Cliente com histórico de atrasos ou inadimplência.",
  BOM_PAGADOR: "Cliente que paga em dia com frequência.",
  OURO:        "Cliente exemplar — nunca atrasou.",
  BLOQUEADO:   "Bloqueado — não emprestar novamente.",
};

export const CLIENT_TIER_COLORS: Record<ClientTier, { bg: string; text: string; border: string; badge: string; name: string }> = {
  INICIANTE:   {
    bg: "bg-slate-500/15",
    text: "text-slate-400",
    border: "border-slate-500/40",
    badge: "bg-slate-500/20 text-slate-300 border-slate-500/40",
    name: "text-slate-300",
  },
  MAU_PAGADOR: {
    bg: "bg-orange-500/15",
    text: "text-orange-400",
    border: "border-orange-500/40",
    badge: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    name: "text-orange-400",
  },
  BOM_PAGADOR: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/40",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    name: "text-emerald-400",
  },
  OURO: {
    bg: "bg-yellow-500/15",
    text: "text-yellow-400",
    border: "border-yellow-500/40",
    badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
    name: "text-yellow-400",
  },
  BLOQUEADO: {
    bg: "bg-red-500/15",
    text: "text-red-400",
    border: "border-red-500/40",
    badge: "bg-red-500/20 text-red-300 border-red-500/40",
    name: "text-red-400",
  },
};

export function getTierColor(tier: ClientTier | null | undefined) {
  return CLIENT_TIER_COLORS[tier ?? "INICIANTE"];
}
