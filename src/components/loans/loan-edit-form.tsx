"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api-client";
import {
  generateInstallments,
  formatCurrency,
  formatDate,
  calculateTotalDebt,
  decimalToNumber,
  type IntervalType,
} from "@/lib/loans/calculations";

export type LoanEditInitialData = {
  clientName: string;
  status: string;
  loanDate: string;
  principal: number;
  interestRate: number;
  installmentsCount: number;
  interval: IntervalType;
  customIntervalDays: number | null;
  penaltyPerDay: number;
  hasPayments: boolean;
};

type LoanEditFormProps = {
  loanId: string;
  initialData: LoanEditInitialData;
  returnHref: string;
};

function toDateInput(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function intervalLabel(interval: string, customDays?: number | null) {
  const map: Record<string, string> = {
    DAILY: "Diário",
    WEEKLY: "Semanal",
    BIWEEKLY: "Quinzenal",
    MONTHLY: "Mensal",
    CUSTOM: customDays ? `Personalizado (${customDays} dias)` : "Personalizado",
  };
  return map[interval] || interval;
}

export function LoanEditForm({ loanId, initialData, returnHref }: LoanEditFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const canEditTerms = initialData.status === "ACTIVE" && !initialData.hasPayments;

  const [loanDate, setLoanDate] = React.useState(toDateInput(initialData.loanDate));
  const [principal, setPrincipal] = React.useState(String(initialData.principal));
  const [interestRate, setInterestRate] = React.useState(String(initialData.interestRate));
  const [installmentsCount, setInstallmentsCount] = React.useState(
    String(initialData.installmentsCount)
  );
  const [interval, setInterval] = React.useState<IntervalType>(initialData.interval);
  const [customIntervalDays, setCustomIntervalDays] = React.useState(
    String(initialData.customIntervalDays ?? 10)
  );
  const [penaltyPerDay, setPenaltyPerDay] = React.useState(String(initialData.penaltyPerDay));

  const principalNum = parseFloat(principal) || 0;
  const interestRateNum = parseFloat(interestRate) || 0;
  const installmentsCountNum = parseInt(installmentsCount, 10) || 0;
  const customDaysNum = parseInt(customIntervalDays, 10) || 10;
  const penaltyNum = parseFloat(penaltyPerDay) || 0;
  const isCustom = interval === "CUSTOM";

  const preview = React.useMemo(() => {
    if (!canEditTerms || principalNum <= 0 || installmentsCountNum <= 0 || !loanDate) {
      return [];
    }
    if (isCustom && customDaysNum <= 0) return [];
    return generateInstallments({
      loanDate: new Date(loanDate + "T12:00:00"),
      principal: principalNum,
      interestRate: interestRateNum,
      installmentsCount: installmentsCountNum,
      interval,
      customIntervalDays: isCustom ? customDaysNum : undefined,
    });
  }, [
    canEditTerms,
    principalNum,
    interestRateNum,
    installmentsCountNum,
    interval,
    loanDate,
    customDaysNum,
    isCustom,
  ]);

  const totalDebt =
    principalNum > 0 ? calculateTotalDebt(principalNum, interestRateNum) : 0;

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.put(`/api/loans/${loanId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loan", loanId] });
      queryClient.invalidateQueries({ queryKey: ["installments", loanId] });
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      toast({ title: "Empréstimo atualizado com sucesso!" });
      router.push(returnHref);
    },
    onError: (err: Error) => {
      toast({
        title: "Erro ao atualizar empréstimo",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload: Record<string, unknown> = {
      penaltyPerDay: penaltyNum,
    };

    if (canEditTerms) {
      if (principalNum <= 0 || installmentsCountNum <= 0 || !loanDate) {
        toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
        return;
      }
      if (isCustom && customDaysNum <= 0) {
        toast({ title: "Informe os dias entre parcelas", variant: "destructive" });
        return;
      }

      Object.assign(payload, {
        loanDate: new Date(loanDate + "T12:00:00").toISOString(),
        principal: principalNum,
        interestRate: interestRateNum,
        installmentsCount: installmentsCountNum,
        interval,
        ...(isCustom ? { customIntervalDays: customDaysNum } : {}),
      });
    }

    mutation.mutate(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {initialData.hasPayments && (
        <Alert>
          <AlertDescription>
            Este empréstimo já possui pagamentos registrados. Apenas a{" "}
            <strong>multa por dia</strong> pode ser alterada.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Cliente</span>
            <p className="font-medium">{initialData.clientName}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Status</span>
            <p className="font-medium">{initialData.status}</p>
          </div>
          {!canEditTerms && (
            <>
              <div>
                <span className="text-muted-foreground">Principal</span>
                <p className="font-medium">{formatCurrency(initialData.principal)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Intervalo</span>
                <p className="font-medium">
                  {intervalLabel(initialData.interval, initialData.customIntervalDays)}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {canEditTerms && (
          <>
            <div className="space-y-2">
              <Label htmlFor="loanDate">Data do empréstimo</Label>
              <Input
                id="loanDate"
                type="date"
                value={loanDate}
                onChange={(e) => setLoanDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="principal">Valor principal (R$)</Label>
              <Input
                id="principal"
                type="number"
                step="0.01"
                min="0.01"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interestRate">Taxa de juros (%)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.01"
                min="0"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="installmentsCount">Número de parcelas</Label>
              <Input
                id="installmentsCount"
                type="number"
                min="1"
                max="30"
                value={installmentsCount}
                onChange={(e) => setInstallmentsCount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interval">Intervalo entre parcelas</Label>
              <Select
                value={interval}
                onValueChange={(v) => setInterval(v as IntervalType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Diário (1 dia)</SelectItem>
                  <SelectItem value="WEEKLY">Semanal (7 dias)</SelectItem>
                  <SelectItem value="BIWEEKLY">Quinzenal (15 dias)</SelectItem>
                  <SelectItem value="MONTHLY">Mensal (30 dias)</SelectItem>
                  <SelectItem value="CUSTOM">Personalizado (N dias)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isCustom && (
              <div className="space-y-2">
                <Label htmlFor="customIntervalDays">Dias entre parcelas</Label>
                <Input
                  id="customIntervalDays"
                  type="number"
                  min="1"
                  max="365"
                  value={customIntervalDays}
                  onChange={(e) => setCustomIntervalDays(e.target.value)}
                />
              </div>
            )}
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="penaltyPerDay">Multa por dia de atraso (%)</Label>
          <Input
            id="penaltyPerDay"
            type="number"
            step="0.01"
            min="0"
            value={penaltyPerDay}
            onChange={(e) => setPenaltyPerDay(e.target.value)}
          />
        </div>
      </div>

      {canEditTerms && totalDebt > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumo financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Principal:</span>
                <p className="font-semibold">{formatCurrency(principalNum)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Total com juros:</span>
                <p className="font-semibold">{formatCurrency(totalDebt)}</p>
              </div>
              {installmentsCountNum > 0 && (
                <div>
                  <span className="text-muted-foreground">Parcela:</span>
                  <p className="font-semibold">
                    {formatCurrency(totalDebt / installmentsCountNum)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {preview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prévia das parcelas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map((inst) => (
                    <TableRow key={inst.number}>
                      <TableCell>{inst.number}</TableCell>
                      <TableCell>{formatDate(inst.dueDate)}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(inst.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push(returnHref)}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={mutation.isPending}>
          Salvar alterações
        </Button>
      </div>
    </form>
  );
}
