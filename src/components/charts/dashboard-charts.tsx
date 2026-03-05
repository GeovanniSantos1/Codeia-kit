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
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowDownUp,
  Landmark,
  CalendarCheck,
  Sparkles,
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
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs text-foreground shadow-md">
      <div className="mb-1 font-medium">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// --- Chart: Transactions (Entrada vs Saída) ---
type TransactionPoint = { label: string; entrada: number; saida: number };

export function TransactionsChart({ data }: { data: TransactionPoint[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Entradas vs Saidas
        </CardTitle>
        <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={50}
                tickFormatter={(v) => formatBRL(v)}
                fontSize={11}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
                content={<ChartTooltip formatter={formatBRL} />}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Bar
                dataKey="entrada"
                name="Entrada"
                fill="hsl(142, 71%, 45%)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="saida"
                name="Saida"
                fill="hsl(0, 84%, 60%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Chart: Loans created per month ---
type LoanPoint = { label: string; count: number; totalPrincipal: number };

export function LoansEvolutionChart({ data }: { data: LoanPoint[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Emprestimos por Mes
        </CardTitle>
        <Landmark className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
            >
              <defs>
                <linearGradient id="loanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />
              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                width={30}
                fontSize={11}
                allowDecimals={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                width={55}
                tickFormatter={(v) => formatBRL(v)}
                fontSize={11}
              />
              <Tooltip
                content={
                  <ChartTooltip
                    formatter={(v) =>
                      v >= 100 ? formatBRL(v) : v.toString()
                    }
                  />
                }
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="totalPrincipal"
                name="Volume (R$)"
                stroke="hsl(var(--primary))"
                fill="url(#loanGrad)"
                strokeWidth={2}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="count"
                name="Quantidade"
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={2}
                dot={{ r: 3.5, strokeWidth: 1 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Chart: Installments status per month ---
type InstallmentPoint = {
  label: string;
  paid: number;
  pending: number;
  overdue: number;
};

export function InstallmentsStatusChart({
  data,
}: {
  data: InstallmentPoint[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Status das Parcelas
        </CardTitle>
        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
              stackOffset="sign"
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={30}
                fontSize={11}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Bar
                dataKey="paid"
                name="Pagas"
                stackId="a"
                fill="hsl(142, 71%, 45%)"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="pending"
                name="Pendentes"
                stackId="a"
                fill="hsl(45, 93%, 47%)"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="overdue"
                name="Atrasadas"
                stackId="a"
                fill="hsl(0, 84%, 60%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Chart: Credit/AI usage per month ---
type CreditPoint = { label: string; chat: number; image: number };

export function CreditUsageChart({ data }: { data: CreditPoint[] }) {
  const hasData = data.some((d) => d.chat > 0 || d.image > 0);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Uso de Creditos IA</CardTitle>
        <Sparkles className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            Nenhum uso de creditos registrado
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={30}
                  fontSize={11}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="chat"
                  name="Chat IA"
                  stroke="hsl(262, 83%, 58%)"
                  strokeWidth={2}
                  dot={{ r: 3.5, strokeWidth: 1 }}
                />
                <Line
                  type="monotone"
                  dataKey="image"
                  name="Geracao de Imagem"
                  stroke="hsl(330, 81%, 60%)"
                  strokeWidth={2}
                  dot={{ r: 3.5, strokeWidth: 1 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
