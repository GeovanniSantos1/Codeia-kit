"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate } from "@/lib/loans/calculations";
import { CheckCircle, Clock } from "lucide-react";

type Installment = {
  id: string;
  number: number;
  dueDate: string;
  amount: number;
  paidAt?: string | null;
  paidAmount?: number | null;
  penalty: number;
  daysOverdue?: number;
  status: string;
};

type InstallmentTableProps = {
  installments: Installment[];
  onPay?: (installment: Installment) => void;
};

function statusBadge(status: string, paymentPercentage?: number) {
  switch (status) {
    case "PAID":
      return <Badge className="bg-emerald-600 text-white">Pago</Badge>;
    case "PARTIALLY_PAID":
      return (
        <Badge className="bg-amber-500 text-white" title={`${paymentPercentage?.toFixed(1)}% pago`}>
          <Clock className="h-3 w-3 mr-1" />
          Parcial
        </Badge>
      );
    case "OVERDUE":
      return <Badge variant="destructive">Atrasado</Badge>;
    case "PENDING":
    default:
      return <Badge variant="secondary">Pendente</Badge>;
  }
}

export function InstallmentTable({ installments, onPay }: InstallmentTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">#</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-right">Multa</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Pago</TableHead>
            <TableHead className="text-right hidden md:table-cell">Restante</TableHead>
            <TableHead className="w-28"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {installments.map((inst) => {
            const isPending = inst.status !== "PAID";
            const isPartiallyPaid = inst.status === "PARTIALLY_PAID" || 
              (inst.paidAmount && inst.paidAmount > 0 && inst.paidAmount < inst.amount + (inst.penalty || 0));
            const total = inst.amount + (inst.penalty || 0);
            const paidAmount = inst.paidAmount || 0;
            const remaining = Math.max(0, total - paidAmount);
            const paymentPercentage = total > 0 ? (paidAmount / total) * 100 : 0;
            const dueDate = new Date(inst.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            dueDate.setHours(0, 0, 0, 0);
            const isOverdue = isPending && dueDate < today;
            const displayStatus = isOverdue && inst.status === "PENDING" ? "OVERDUE" : inst.status;
            
            // Determina se o botão de pagar deve aparecer
            const canPay = (isPending || isPartiallyPaid) && onPay && remaining > 0.01;

            return (
              <TableRow key={inst.id}>
                <TableCell className="font-medium">{inst.number}</TableCell>
                <TableCell>{formatDate(inst.dueDate)}</TableCell>
                <TableCell className="text-right">{formatCurrency(inst.amount)}</TableCell>
                <TableCell className="text-right">
                  {inst.penalty > 0 ? (
                    <span className="text-destructive">{formatCurrency(inst.penalty)}</span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(total)}</TableCell>
                <TableCell>{statusBadge(displayStatus, paymentPercentage)}</TableCell>
                <TableCell className="text-right">
                  {paidAmount > 0 ? (
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-emerald-600 font-medium">{formatCurrency(paidAmount)}</span>
                      {isPartiallyPaid && (
                        <span className="text-xs text-muted-foreground">
                          {paymentPercentage.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-right hidden md:table-cell">
                  {remaining > 0.01 ? (
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-orange-600 font-medium">{formatCurrency(remaining)}</span>
                      {isPartiallyPaid && (
                        <Progress value={paymentPercentage} className="h-1.5 w-16" />
                      )}
                    </div>
                  ) : (
                    <span className="text-emerald-600">Quitado</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {canPay ? (
                    <Button size="sm" variant="outline" onClick={() => onPay(inst)}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {isPartiallyPaid ? "Continuar" : "Pagar"}
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
