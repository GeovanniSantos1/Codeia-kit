"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { usePageConfig } from "@/hooks/use-page-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoanList } from "@/components/loans/loan-list";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CLIENT_TIER_LABELS, CLIENT_TIER_EMOJI } from "@/lib/loans/client-tier";

export default function LoansPage() {
  usePageConfig("Empréstimos", "Gerencie todos os seus empréstimos", [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Empréstimos" },
  ]);

  const [status, setStatus] = React.useState<string>("all");
  const [overdue, setOverdue] = React.useState(false);
  const [clientSearch, setClientSearch] = React.useState("");
  const [tierFilter, setTierFilter] = React.useState<string>("all");
  const [page, setPage] = React.useState(1);

  const queryParams = React.useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "20");
    if (status !== "all") params.set("status", status);
    if (overdue) params.set("overdue", "true");
    return params.toString();
  }, [status, overdue, page]);

  const { data, isLoading } = useQuery({
    queryKey: ["loans", queryParams],
    queryFn: () => api.get<any>(`/api/loans?${queryParams}`),
  });

  const loans = data?.data || [];
  const pagination = data?.pagination;

  const filteredLoans = loans.filter((l: any) => {
    if (clientSearch && !l.client.name.toLowerCase().includes(clientSearch.toLowerCase())) return false;
    if (tierFilter !== "all" && (l.client.tier ?? "INICIANTE") !== tierFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Buscar por cliente..."
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            className="w-60"
          />
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setOverdue(false);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ACTIVE">Ativos</SelectItem>
              <SelectItem value="PAID_OFF">Quitados</SelectItem>
              <SelectItem value="CANCELLED">Cancelados</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={tierFilter}
            onValueChange={(v) => { setTierFilter(v); setPage(1); }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Nível do cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os níveis</SelectItem>
              <SelectItem value="INICIANTE">{CLIENT_TIER_EMOJI.INICIANTE} {CLIENT_TIER_LABELS.INICIANTE}</SelectItem>
              <SelectItem value="MAU_PAGADOR">{CLIENT_TIER_EMOJI.MAU_PAGADOR} {CLIENT_TIER_LABELS.MAU_PAGADOR}</SelectItem>
              <SelectItem value="BOM_PAGADOR">{CLIENT_TIER_EMOJI.BOM_PAGADOR} {CLIENT_TIER_LABELS.BOM_PAGADOR}</SelectItem>
              <SelectItem value="OURO">{CLIENT_TIER_EMOJI.OURO} {CLIENT_TIER_LABELS.OURO}</SelectItem>
              <SelectItem value="BLOQUEADO">{CLIENT_TIER_EMOJI.BLOQUEADO} {CLIENT_TIER_LABELS.BLOQUEADO}</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={overdue ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setOverdue(!overdue);
              setStatus("all");
              setPage(1);
            }}
          >
            Inadimplentes
          </Button>
        </div>
        <Button asChild>
          <Link href="/loans/new">
            <Plus className="h-4 w-4 mr-1" />
            Novo Empréstimo
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <LoanList loans={filteredLoans} />
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="flex items-center text-sm text-muted-foreground px-3">
            Página {page} de {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
