"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate } from "@/lib/loans/calculations";

type Installment = {
  id: string;
  number: number;
  dueDate: string;
  amount: number;
  paidAmount?: number | null;
  penalty: number;
  status: string;
};

type PayInstallmentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  installment: Installment | null;
  onConfirm: (data: { installmentId: string; paidAmount: number; paidAt: string }) => void;
  isLoading?: boolean;
};

export function PayInstallmentDialog({
  open,
  onOpenChange,
  installment,
  onConfirm,
  isLoading,
}: PayInstallmentDialogProps) {
  const [paidAmount, setPaidAmount] = React.useState("");
  const [paidAt, setPaidAt] = React.useState("");

  React.useEffect(() => {
    if (installment && open) {
      const total = installment.amount + (installment.penalty || 0);
      const alreadyPaid = installment.paidAmount || 0;
      const remaining = Math.max(0, total - alreadyPaid);
      // Preenche com o valor restante por padrão
      setPaidAmount(String(remaining.toFixed(2)));
      setPaidAt(new Date().toISOString().split("T")[0]);
    }
  }, [installment, open]);

  if (!installment) return null;

  const totalDue = installment.amount + (installment.penalty || 0);
  const alreadyPaid = installment.paidAmount || 0;
  const remaining = Math.max(0, totalDue - alreadyPaid);
  const paymentPercentage = totalDue > 0 ? (alreadyPaid / totalDue) * 100 : 0;
  const isPartiallyPaid = alreadyPaid > 0 && alreadyPaid < totalDue;

  const handlePaidAmountChange = (value: string) => {
    // Limita o valor ao máximo restante
    const numValue = parseFloat(value) || 0;
    if (numValue > remaining) {
      setPaidAmount(remaining.toFixed(2));
    } else {
      setPaidAmount(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
          <DialogDescription>
            Parcela {installment.number} — Vencimento: {formatDate(installment.dueDate)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumo da parcela */}
          <div className="rounded-lg border p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor da parcela:</span>
              <span>{formatCurrency(installment.amount)}</span>
            </div>
            {installment.penalty > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Multa/Juros:</span>
                <span className="text-destructive">{formatCurrency(installment.penalty)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-1">
              <span className="text-muted-foreground">Total devido:</span>
              <span className="font-medium">{formatCurrency(totalDue)}</span>
            </div>
          </div>

          {/* Progresso do pagamento (só aparece se já houver pagamento parcial) */}
          {isPartiallyPaid && (
            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valor já pago:</span>
                <span className="text-emerald-600 font-medium">{formatCurrency(alreadyPaid)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Restante:</span>
                <span className="text-orange-600 font-medium">{formatCurrency(remaining)}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progresso:</span>
                  <span className="font-medium">{paymentPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={paymentPercentage} className="h-2" />
              </div>
            </div>
          )}

          {/* Campo de valor a pagar */}
          <div className="space-y-2">
            <Label htmlFor="paidAmount">
              Valor a pagar (R$)
              {remaining > 0 && (
                <span className="text-muted-foreground text-xs ml-2">
                  (máx: {formatCurrency(remaining)})
                </span>
              )}
            </Label>
            <Input
              id="paidAmount"
              type="number"
              step="0.01"
              min="0.01"
              max={remaining}
              value={paidAmount}
              onChange={(e) => handlePaidAmountChange(e.target.value)}
            />
            {parseFloat(paidAmount) > remaining && (
              <p className="text-xs text-destructive">
                O valor não pode exceder {formatCurrency(remaining)}
              </p>
            )}
          </div>

          {/* Campo de data */}
          <div className="space-y-2">
            <Label htmlFor="paidAt">Data do pagamento</Label>
            <Input
              id="paidAt"
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
            />
          </div>

          {/* Preview do resultado */}
          {paidAmount && parseFloat(paidAmount) > 0 && parseFloat(paidAmount) <= remaining && (
            <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Novo valor pago:</span>
                <span className="font-medium">
                  {formatCurrency(alreadyPaid + parseFloat(paidAmount))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Que restará:</span>
                <span className="font-medium">
                  {formatCurrency(Math.max(0, remaining - parseFloat(paidAmount)))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status após pagamento:</span>
                <span className="font-medium">
                  {alreadyPaid + parseFloat(paidAmount) >= totalDue * 0.99
                    ? "Pago"
                    : "Pago Parcialmente"}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            isLoading={isLoading}
            disabled={!paidAmount || parseFloat(paidAmount) <= 0 || parseFloat(paidAmount) > remaining}
            onClick={() => {
              if (!paidAmount || !paidAt) return;
              onConfirm({
                installmentId: installment.id,
                paidAmount: parseFloat(paidAmount),
                paidAt: new Date(paidAt + "T12:00:00").toISOString(),
              });
            }}
          >
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
