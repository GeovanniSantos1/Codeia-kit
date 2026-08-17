"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import {
  type LoanListFilters,
  buildLoanListSearchParams,
  buildLoanListApiQuery,
  parseLoanListFilters,
} from "@/lib/loans/list-filters";

function LoansPageContent() {
  usePageConfig("Empréstimos", "Gerencie todos os seus empréstimos", [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Empréstimos" },
  ]);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = React.useMemo(
    () => parseLoanListFilters(searchParams),
    [searchParams]
  );

  const listQuery = React.useMemo(
    () => buildLoanListSearchParams(filters).toString(),
    [filters]
  );

  const updateFilters = React.useCallback(
    (updates: Partial<LoanListFilters>) => {
      const next: LoanListFilters = { ...filters, ...updates };
      const qs = buildLoanListSearchParams(next).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [filters, pathname, router]
  );

  const queryParams = React.useMemo(
    () => buildLoanListApiQuery(filters),
    [filters]
  );

  const { data, isLoading } = useQuery({
    queryKey: ["loans", queryParams],
    queryFn: () => api.get<any>(`/api/loans?${queryParams}`),
  });

  const loans = data?.data || [];
  const pagination = data?.pagination;

  const filteredLoans = loans.filter((l: any) => {
    if (filters.clientSearch && !l.client.name.toLowerCase().includes(filters.clientSearch.toLowerCase())) {
      return false;
    }
    if (filters.tierFilter !== "all" && (l.client.tier ?? "INICIANTE") !== filters.tierFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Buscar por cliente..."
            value={filters.clientSearch}
            onChange={(e) => updateFilters({ clientSearch: e.target.value, page: 1 })}
            className="w-60"
          />
          <Select
            value={filters.status}
            onValueChange={(v) => updateFilters({ status: v, overdue: false, page: 1 })}
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
            value={filters.tierFilter}
            onValueChange={(v) => updateFilters({ tierFilter: v, page: 1 })}
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
            variant={filters.overdue ? "default" : "outline"}
            size="sm"
            onClick={() =>
              updateFilters({
                overdue: !filters.overdue,
                status: "all",
                page: 1,
              })
            }
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
        <LoanList loans={filteredLoans} listQuery={listQuery} />
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page <= 1}
            onClick={() => updateFilters({ page: filters.page - 1 })}
          >
            Anterior
          </Button>
          <span className="flex items-center text-sm text-muted-foreground px-3">
            Página {filters.page} de {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page >= pagination.totalPages}
            onClick={() => updateFilters({ page: filters.page + 1 })}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}

function LoansPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full max-w-2xl" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function LoansPage() {
  return (
    <React.Suspense fallback={<LoansPageSkeleton />}>
      <LoansPageContent />
    </React.Suspense>
  );
}
