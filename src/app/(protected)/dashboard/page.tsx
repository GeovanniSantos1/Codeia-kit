"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useSetPageMetadata } from "@/contexts/page-metadata";
import { DashboardMetrics } from "@/components/loans/dashboard-metrics";
import { DueTodayList } from "@/components/loans/due-today-list";
import { OverdueList } from "@/components/loans/overdue-list";
import {
  TransactionsChart,
  LoansEvolutionChart,
  InstallmentsStatusChart,
  CreditUsageChart,
} from "@/components/charts/dashboard-charts";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  const { user } = useUser();
  const [metrics, setMetrics] = useState(null);
  const [dueToday, setDueToday] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [charts, setCharts] = useState<{
    transactionsSeries: { label: string; entrada: number; saida: number }[];
    loansSeries: { label: string; count: number; totalPrincipal: number }[];
    installmentsSeries: { label: string; paid: number; pending: number; overdue: number }[];
    creditsSeries: { label: string; chat: number; image: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);

  useSetPageMetadata({
    title: `Bem-vindo, ${user?.firstName || "Usuário"}!`,
    description: "Visão geral dos seus empréstimos",
    breadcrumbs: [{ label: "Dashboard" }],
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [metricsRes, todayRes, overdueRes] = await Promise.all([
          fetch("/api/reports/dashboard"),
          fetch("/api/reports/today"),
          fetch("/api/reports/overdue"),
        ]);
        if (metricsRes.ok) {
          const metricsJson = await metricsRes.json();
          setMetrics(metricsJson.data || metricsJson);
        }
        if (todayRes.ok) {
          const todayJson = await todayRes.json();
          setDueToday(todayJson.data || todayJson || []);
        }
        if (overdueRes.ok) {
          const overdueJson = await overdueRes.json();
          setOverdue(overdueJson.data || overdueJson || []);
        }
      } catch (e) {
        console.error("Failed to fetch dashboard data", e);
      } finally {
        setLoading(false);
      }
    }

    async function fetchCharts() {
      try {
        const res = await fetch("/api/reports/charts");
        if (res.ok) {
          const json = await res.json();
          setCharts(json);
        }
      } catch (e) {
        console.error("Failed to fetch chart data", e);
      } finally {
        setChartsLoading(false);
      }
    }

    fetchData();
    fetchCharts();
  }, []);

  return (
    <div className="space-y-6">
      <DashboardMetrics metrics={metrics} isLoading={loading} />

      <div className="grid gap-6 md:grid-cols-2">
        <DueTodayList installments={dueToday} isLoading={loading} />
        <OverdueList installments={overdue} isLoading={loading} limit={10} />
      </div>

      {chartsLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-64 w-full animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : charts ? (
        <div className="grid gap-6 md:grid-cols-2">
          <TransactionsChart data={charts.transactionsSeries} />
          <LoansEvolutionChart data={charts.loansSeries} />
          <InstallmentsStatusChart data={charts.installmentsSeries} />
          <CreditUsageChart data={charts.creditsSeries} />
        </div>
      ) : null}
    </div>
  );
}
