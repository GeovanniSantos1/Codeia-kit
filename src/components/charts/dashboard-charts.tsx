"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import {
  ArrowDownUp,
  Landmark,
  CalendarCheck,
  Users,
} from "lucide-react";

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  formatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const fmt = formatter || ((v: number) => v.toString());
  return (
    <div className="rounded-xl border border-white/10 bg-[#111114]/95 backdrop-blur-sm px-3 py-2.5 text-xs text-foreground shadow-xl">
      <div className="mb-1.5 font-semibold text-white/80">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-white/50">{p.name}:</span>
          <span className="font-bold text-white">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

const AXIS_PROPS = {
  tickLine: false,
  axisLine: false,
  tick: { fill: "rgba(255,255,255,0.35)", fontSize: 11 },
};

const GRID_PROPS = {
  strokeDasharray: "4 4",
  stroke: "rgba(255,255,255,0.06)",
};

function ChartCard({
  title,
  icon: Icon,
  accent,
  children,
}: {
  title: string;
  icon: React.ElementType;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border ${accent} bg-[#0c0c0e] overflow-hidden`}>
      <div className="flex items-center justify-between px-5 pt-4 pb-1">
        <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-muted-foreground">
          {title}
        </span>
        <Icon className="h-4 w-4 text-muted-foreground/60" />
      </div>
      <div className="px-2 pb-4 pt-2">
        {children}
      </div>
    </div>
  );
}

// --- Chart: Transactions (Entrada vs Saída) ---
type TransactionPoint = { label: string; entrada: number; saida: number };

export function TransactionsChart({ data }: { data: TransactionPoint[] }) {
  return (
    <ChartCard title="Entradas vs Saídas" icon={ArrowDownUp} accent="border-cyan-500/15">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 6, right: 8, left: -4, bottom: 4 }}>
            <defs>
              <linearGradient id="entradaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="saidaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f87171" stopOpacity={1} />
                <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="label" {...AXIS_PROPS} />
            <YAxis
              {...AXIS_PROPS}
              width={54}
              tickFormatter={(v) => formatBRL(v)}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              content={<ChartTooltip formatter={formatBRL} />}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={7}
              wrapperStyle={{ fontSize: 11, paddingBottom: 8, color: "rgba(255,255,255,0.5)" }}
            />
            <Bar dataKey="entrada" name="Entrada" fill="url(#entradaGrad)" radius={[5, 5, 0, 0]} maxBarSize={36} />
            <Bar dataKey="saida" name="Saída" fill="url(#saidaGrad)" radius={[5, 5, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// --- Chart: Loans created per month ---
type LoanPoint = { label: string; count: number; totalPrincipal: number };

export function LoansEvolutionChart({ data }: { data: LoanPoint[] }) {
  return (
    <ChartCard title="Empréstimos por Mês" icon={Landmark} accent="border-violet-500/15">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 8, left: -4, bottom: 4 }}>
            <defs>
              <linearGradient id="loanVolGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="label" {...AXIS_PROPS} />
            <YAxis
              yAxisId="left"
              {...AXIS_PROPS}
              width={28}
              allowDecimals={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              {...AXIS_PROPS}
              width={56}
              tickFormatter={(v) => formatBRL(v)}
            />
            <Tooltip
              content={
                <ChartTooltip
                  formatter={(v) => (v >= 100 ? formatBRL(v) : v.toString())}
                />
              }
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={7}
              wrapperStyle={{ fontSize: 11, paddingBottom: 8, color: "rgba(255,255,255,0.5)" }}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="totalPrincipal"
              name="Volume (R$)"
              stroke="#8b5cf6"
              fill="url(#loanVolGrad)"
              strokeWidth={2.5}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="count"
              name="Quantidade"
              stroke="#60a5fa"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#60a5fa", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// --- Chart: Installments status per month ---
type InstallmentPoint = { label: string; paid: number; pending: number; overdue: number };

export function InstallmentsStatusChart({ data }: { data: InstallmentPoint[] }) {
  return (
    <ChartCard title="Status das Parcelas" icon={CalendarCheck} accent="border-emerald-500/15">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 6, right: 8, left: -4, bottom: 4 }} stackOffset="sign">
            <defs>
              <linearGradient id="paidGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="pendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#eab308" stopOpacity={1} />
                <stop offset="100%" stopColor="#ca8a04" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="overdGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                <stop offset="100%" stopColor="#b91c1c" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="label" {...AXIS_PROPS} />
            <YAxis {...AXIS_PROPS} width={28} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={7}
              wrapperStyle={{ fontSize: 11, paddingBottom: 8, color: "rgba(255,255,255,0.5)" }}
            />
            <Bar dataKey="paid" name="Pagas" stackId="a" fill="url(#paidGrad)" radius={[0, 0, 0, 0]} maxBarSize={36} />
            <Bar dataKey="pending" name="Pendentes" stackId="a" fill="url(#pendGrad)" radius={[0, 0, 0, 0]} maxBarSize={36} />
            <Bar dataKey="overdue" name="Atrasadas" stackId="a" fill="url(#overdGrad)" radius={[5, 5, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// --- Chart: New clients per month ---
type ClientPoint = { label: string; count: number };

export function NewClientsChart({ data }: { data: ClientPoint[] }) {
  return (
    <ChartCard title="Novos Clientes por Mês" icon={Users} accent="border-cyan-500/15">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 8, left: -4, bottom: 4 }}>
            <defs>
              <linearGradient id="clientGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="label" {...AXIS_PROPS} />
            <YAxis {...AXIS_PROPS} width={28} allowDecimals={false} />
            <Tooltip content={<ChartTooltip formatter={(v) => `${v} cliente${v !== 1 ? "s" : ""}`} />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Area
              type="monotone"
              dataKey="count"
              name="Novos clientes"
              stroke="#06b6d4"
              fill="url(#clientGrad)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#06b6d4", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#22d3ee" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
