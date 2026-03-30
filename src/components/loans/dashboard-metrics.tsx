"use client";

import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Bell, Briefcase } from "lucide-react";

type DashboardMetricsProps = {
  metrics: {
    totalLent: number;
    totalReceived: number;
    totalOwed: number;
    receivedPrincipal: number;
    receivedInterest: number;
    provisionTotal: number;
    overdueCount: number;
    dueTodayCount: number;
    activeLoansCount: number;
  } | null;
  isLoading: boolean;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function pct(part: number, total: number) {
  if (!total) return 0;
  return Math.min(100, Math.round((part / total) * 100));
}

type CardConfig = {
  title: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  borderClass: string;
  iconBgStyle: React.CSSProperties;
  barStyle: React.CSSProperties;
  glowStyle: React.CSSProperties;
  barPct: number;
};

function MetricCard({ card }: { card: CardConfig }) {
  const Icon = card.icon;
  return (
    <div
      className={`relative rounded-2xl overflow-hidden border ${card.borderClass} bg-[#0c0c0e] transition-transform duration-300 hover:scale-[1.025] group cursor-default`}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={card.glowStyle}
      />

      <div className="relative p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-2">
              {card.title}
            </p>
            <p className="text-[1.7rem] font-black tracking-tight text-white leading-none truncate">
              {card.value}
            </p>
          </div>
          <div
            className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
            style={card.iconBgStyle}
          >
            <Icon className="h-5 w-5 text-white" strokeWidth={2.2} />
          </div>
        </div>

        <p className="text-[11.5px] text-muted-foreground leading-snug mb-4 min-h-[2.5em]">
          {card.sub}
        </p>

        <div className="w-full h-[3px] rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ ...card.barStyle, width: `${card.barPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0c0c0e] p-5 space-y-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1 pr-3">
          <div className="h-[10px] w-28 bg-white/8 rounded" />
          <div className="h-7 w-36 bg-white/10 rounded" />
        </div>
        <div className="w-11 h-11 rounded-xl bg-white/8" />
      </div>
      <div className="h-[11px] w-44 bg-white/5 rounded" />
      <div className="h-[3px] w-full bg-white/5 rounded-full" />
    </div>
  );
}

export function DashboardMetrics({ metrics, isLoading }: DashboardMetricsProps) {
  if (isLoading || !metrics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  const receivedPct = pct(metrics.totalReceived, metrics.totalLent);
  const owedPct = pct(metrics.totalOwed, metrics.totalLent);
  const overduePct = metrics.overdueCount > 0
    ? Math.min(100, Math.round((metrics.overdueCount / Math.max(metrics.activeLoansCount, 1)) * 100))
    : 0;

  const cards: CardConfig[] = [
    {
      title: "Total Emprestado",
      value: formatCurrency(metrics.totalLent),
      sub: `${metrics.activeLoansCount} empréstimo${metrics.activeLoansCount !== 1 ? "s" : ""} ativo${metrics.activeLoansCount !== 1 ? "s" : ""} no momento`,
      icon: DollarSign,
      borderClass: "border-cyan-500/25",
      iconBgStyle: { background: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)" },
      barStyle: { background: "linear-gradient(90deg, #0891b2, #22d3ee)" },
      glowStyle: { background: "radial-gradient(ellipse at top left, rgba(6,182,212,0.12) 0%, transparent 65%)" },
      barPct: 100,
    },
    {
      title: "Total Recebido",
      value: formatCurrency(metrics.totalReceived),
      sub: `${receivedPct}% do capital emprestado já retornou`,
      icon: TrendingUp,
      borderClass: "border-emerald-500/25",
      iconBgStyle: { background: "linear-gradient(135deg, #059669 0%, #10b981 100%)" },
      barStyle: { background: "linear-gradient(90deg, #059669, #34d399)" },
      glowStyle: { background: "radial-gradient(ellipse at top left, rgba(16,185,129,0.12) 0%, transparent 65%)" },
      barPct: receivedPct,
    },
    {
      title: "Total Devido",
      value: formatCurrency(metrics.totalOwed),
      sub: `${owedPct}% do capital ainda está em aberto`,
      icon: TrendingDown,
      borderClass: "border-orange-500/25",
      iconBgStyle: { background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)" },
      barStyle: { background: "linear-gradient(90deg, #ea580c, #fb923c)" },
      glowStyle: { background: "radial-gradient(ellipse at top left, rgba(249,115,22,0.12) 0%, transparent 65%)" },
      barPct: owedPct,
    },
    {
      title: "Empréstimos Ativos",
      value: metrics.activeLoansCount.toString(),
      sub: "Contratos em andamento atualmente",
      icon: Briefcase,
      borderClass: "border-violet-500/25",
      iconBgStyle: { background: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)" },
      barStyle: { background: "linear-gradient(90deg, #7c3aed, #a78bfa)" },
      glowStyle: { background: "radial-gradient(ellipse at top left, rgba(139,92,246,0.12) 0%, transparent 65%)" },
      barPct: Math.min(100, metrics.activeLoansCount * 12),
    },
    {
      title: "Vence Hoje",
      value: metrics.dueTodayCount.toString(),
      sub: metrics.dueTodayCount === 0
        ? "Nenhuma parcela vence hoje"
        : `${metrics.dueTodayCount} parcela${metrics.dueTodayCount !== 1 ? "s" : ""} para cobrar hoje`,
      icon: Bell,
      borderClass: metrics.dueTodayCount > 0 ? "border-yellow-400/35" : "border-yellow-500/15",
      iconBgStyle: metrics.dueTodayCount > 0
        ? { background: "linear-gradient(135deg, #ca8a04 0%, #eab308 100%)" }
        : { background: "linear-gradient(135deg, #854d0e 0%, #a16207 100%)" },
      barStyle: { background: "linear-gradient(90deg, #ca8a04, #facc15)" },
      glowStyle: { background: "radial-gradient(ellipse at top left, rgba(234,179,8,0.12) 0%, transparent 65%)" },
      barPct: metrics.dueTodayCount > 0 ? 100 : 0,
    },
    {
      title: "Inadimplentes",
      value: metrics.overdueCount.toString(),
      sub: metrics.overdueCount === 0
        ? "Ótimo! Carteira sem atrasos registrados"
        : `${overduePct}% da carteira ativa em atraso`,
      icon: AlertTriangle,
      borderClass: metrics.overdueCount > 0 ? "border-red-500/35" : "border-red-500/15",
      iconBgStyle: metrics.overdueCount > 0
        ? { background: "linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)" }
        : { background: "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)" },
      barStyle: { background: "linear-gradient(90deg, #b91c1c, #f87171)" },
      glowStyle: { background: "radial-gradient(ellipse at top left, rgba(239,68,68,0.12) 0%, transparent 65%)" },
      barPct: overduePct,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <MetricCard key={card.title} card={card} />
      ))}
    </div>
  );
}
