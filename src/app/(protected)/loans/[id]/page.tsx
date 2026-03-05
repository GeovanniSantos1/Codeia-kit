"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { usePageConfig } from "@/hooks/use-page-config";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InstallmentTable } from "@/components/loans/installment-table";
import { PayInstallmentDialog } from "@/components/loans/pay-installment-dialog";
import {
  formatCurrency,
  formatDate,
  decimalToNumber,
} from "@/lib/loans/calculations";
import { ArrowLeft, XCircle } from "lucide-react";

function statusBadge(status: string) {
  switch (status) {
    case "ACTIVE":
      return <Badge className="bg-blue-600 text-white">Ativo</Badge>;
    case "PAID_OFF":
      return <Badge className="bg-emerald-600 text-white">Quitado</Badge>;
    case "CANCELLED":
      return <Badge variant="secondary">Cancelado</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function intervalLabel(interval: string) {
  const map: Record<string, string> = {
    DAILY: "Diário",
    WEEKLY: "Semanal",
    BIWEEKLY: "Quinzenal",
    MONTHLY: "Mensal",
  };
  return map[interval] || interval;
}

export default function LoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [payingInstallment, setPayingInstallment] = React.useState<any>(null);

  usePageConfig("Detalhes do Empréstimo", "", [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Empréstimos", href: "/loans" },
    { label: "Detalhes" },
  ]);

  const { data: loanData, isLoading: loadingLoan } = useQuery({
    queryKey: ["loan", id],
    queryFn: () => api.get<any>(`/api/loans/${id}`),
    enabled: !!id,
  });

  const { data: installmentsData, isLoading: loadingInstallments } = useQuery({
    queryKey: ["installments", id],
    queryFn: () => api.get<any>(`/api/loans/${id}/installments`),
    enabled: !!id,
  });

  const payMutation = useMutation({
    mutationFn: (data: { installmentId: string; paidAmount: number; paidAt: string }) =>
      api.put(`/api/loans/${id}/installments`, data),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["loan", id] });
      queryClient.invalidateQueries({ queryKey: ["installments", id] });
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      setPayingInstallment(null);
      toast({
        title: res.loanPaidOff
          ? "Empréstimo quitado!"
          : "Pagamento registrado!",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Erro ao registrar pagamento",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.delete(`/api/loans/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loan", id] });
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      toast({ title: "Empréstimo cancelado" });
    },
    onError: (err: any) => {
      toast({
        title: "Erro ao cancelar",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  if (loadingLoan) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const loan = loanData?.data;
  if (!loan) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Empréstimo não encontrado.
      </div>
    );
  }

  const principal = typeof loan.principal === "number" ? loan.principal : decimalToNumber(loan.principal);
  const interestRate = typeof loan.interestRate === "number" ? loan.interestRate : decimalToNumber(loan.interestRate);
  const penaltyPerDay = typeof loan.penaltyPerDay === "number" ? loan.penaltyPerDay : decimalToNumber(loan.penaltyPerDay);
  const interest = principal * (interestRate / 100);
  const totalDebt = principal + interest;

  const installments = installmentsData?.data || [];
  // Conta parcelas totalmente pagas
  const paidCount = installments.filter((i: any) => i.status === "PAID").length;
  // Conta parcelas parcialmente pagas
  const partiallyPaidCount = installments.filter((i: any) => i.status === "PARTIALLY_PAID" || (i.paidAmount && i.paidAmount > 0 && i.status !== "PAID")).length;
  // Total pago considera tanto parcelas pagas quanto pagamentos parciais
  const totalPaid = installments.reduce((sum: number, i: any) => sum + (i.paidAmount || 0), 0);
  // Total restante considera o valor já pago em parcelas parciais
  const totalRemaining = installments.reduce((sum: number, i: any) => {
    const total = i.amount + (i.penalty || 0);
    const paid = i.paidAmount || 0;
    return sum + Math.max(0, total - paid);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push("/loans")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
        {loan.status === "ACTIVE" && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => cancelMutation.mutate()}
            isLoading={cancelMutation.isPending}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Cancelar Empréstimo
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold">{loan.client.name}</h2>
        {statusBadge(loan.status)}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Principal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{formatCurrency(principal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total com Juros</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{formatCurrency(totalDebt)}</p>
            <p className="text-xs text-muted-foreground">{interestRate}% juros</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Recebido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
            <p className="text-xs text-muted-foreground">
              {paidCount}/{loan.installmentsCount} parcelas
              {partiallyPaidCount > 0 && (
                <span className="text-amber-600 ml-1">({partiallyPaidCount} parcial)</span>
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Restante</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-orange-600">{formatCurrency(totalRemaining)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Data:</span>
          <p className="font-medium">{formatDate(loan.loanDate)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Intervalo:</span>
          <p className="font-medium">{intervalLabel(loan.interval)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Multa/dia:</span>
          <p className="font-medium">{penaltyPerDay}%</p>
        </div>
        <div>
          <span className="text-muted-foreground">Parcelas:</span>
          <p className="font-medium">{loan.installmentsCount}x de {formatCurrency(totalDebt / loan.installmentsCount)}</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Parcelas</h3>
        {loadingInstallments ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <InstallmentTable
            installments={installments}
            onPay={loan.status === "ACTIVE" ? setPayingInstallment : undefined}
          />
        )}
      </div>

      <PayInstallmentDialog
        open={!!payingInstallment}
        onOpenChange={(open) => !open && setPayingInstallment(null)}
        installment={payingInstallment}
        onConfirm={(data) => payMutation.mutate(data)}
        isLoading={payMutation.isPending}
      />
    </div>
  );
}
