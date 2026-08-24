"use client";

import * as React from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { LoanEditForm } from "@/components/loans/loan-edit-form";
import { usePageConfig } from "@/hooks/use-page-config";
import { api } from "@/lib/api-client";
import { decimalToNumber, type IntervalType } from "@/lib/loans/calculations";
import { buildLoansListHref, parseLoanListFilters } from "@/lib/loans/list-filters";

function EditLoanPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const loanId = params.id as string;

  const loansListHref = React.useMemo(
    () => buildLoansListHref(parseLoanListFilters(searchParams)),
    [searchParams]
  );

  const returnHref = React.useMemo(() => {
    const qs = searchParams.toString();
    return qs ? `/loans/${loanId}?${qs}` : `/loans/${loanId}`;
  }, [loanId, searchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ["loan", loanId],
    queryFn: () => api.get<any>(`/api/loans/${loanId}`),
    enabled: !!loanId,
  });

  const loan = data?.data;

  usePageConfig(
    loan ? `Editar empréstimo · ${loan.client.name}` : "Editar Empréstimo",
    "Atualizar dados do empréstimo",
    [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Empréstimos", href: loansListHref },
      { label: loan?.client?.name || "Detalhes", href: returnHref },
      { label: "Editar" },
    ]
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Empréstimo não encontrado.</p>
      </div>
    );
  }

  if (loan.status === "CANCELLED") {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Empréstimos cancelados não podem ser editados.</p>
      </div>
    );
  }

  const hasPayments = (loan.installments ?? []).some(
    (inst: { status: string; paidAmount?: unknown }) =>
      inst.status === "PAID" ||
      inst.status === "PARTIALLY_PAID" ||
      (inst.paidAmount != null && decimalToNumber(inst.paidAmount as never) > 0)
  );

  return (
    <LoanEditForm
      loanId={loanId}
      returnHref={returnHref}
      initialData={{
        clientName: loan.client.name,
        status: loan.status,
        loanDate: loan.loanDate,
        principal: decimalToNumber(loan.principal),
        interestRate: decimalToNumber(loan.interestRate),
        installmentsCount: loan.installmentsCount,
        interval: loan.interval as IntervalType,
        customIntervalDays: loan.customIntervalDays,
        penaltyPerDay: decimalToNumber(loan.penaltyPerDay),
        hasPayments,
      }}
    />
  );
}

function EditLoanPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64" />
      <Skeleton className="h-48" />
    </div>
  );
}

export default function EditLoanPage() {
  return (
    <React.Suspense fallback={<EditLoanPageSkeleton />}>
      <EditLoanPageContent />
    </React.Suspense>
  );
}
