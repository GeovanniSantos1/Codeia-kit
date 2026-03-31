"use client";

import * as React from "react";
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
import {
  generateInstallments,
  formatCurrency,
  formatDate,
  calculateTotalDebt,
  type IntervalType,
} from "@/lib/loans/calculations";
import {
  type RiskLevel,
  RISK_LEVEL_LABELS,
  getRiskLevelColor,
} from "@/lib/loans/risk-score";

type Client = {
  id: string;
  name: string;
  riskScore?: number | null;
  riskLevel?: RiskLevel | null;
};

type LoanFormProps = {
  clients: Client[];
  onSubmit: (data: {
    clientId: string;
    loanDate: string;
    principal: number;
    interestRate: number;
    installmentsCount: number;
    interval: string;
    customIntervalDays?: number;
    penaltyPerDay: number;
  }) => void;
  isLoading?: boolean;
};

export function LoanForm({ clients, onSubmit, isLoading }: LoanFormProps) {
  const [clientId, setClientId] = React.useState("");
  const [loanDate, setLoanDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [principal, setPrincipal] = React.useState("");
  const [interestRate, setInterestRate] = React.useState("");
  const [installmentsCount, setInstallmentsCount] = React.useState("");
  const [interval, setInterval] = React.useState<IntervalType>("MONTHLY");
  const [customIntervalDays, setCustomIntervalDays] = React.useState("10");
  const [penaltyPerDay, setPenaltyPerDay] = React.useState("0");

  const selectedClient = clients.find((c) => c.id === clientId) ?? null;

  const principalNum = parseFloat(principal) || 0;
  const interestRateNum = parseFloat(interestRate) || 0;
  const installmentsCountNum = parseInt(installmentsCount) || 0;
  const customDaysNum = parseInt(customIntervalDays) || 10;
  const isCustom = interval === "CUSTOM";

  const preview = React.useMemo(() => {
    if (principalNum <= 0 || installmentsCountNum <= 0 || !loanDate) return [];
    if (isCustom && customDaysNum <= 0) return [];
    return generateInstallments({
      loanDate: new Date(loanDate + "T12:00:00"),
      principal: principalNum,
      interestRate: interestRateNum,
      installmentsCount: installmentsCountNum,
      interval,
      customIntervalDays: isCustom ? customDaysNum : undefined,
    });
  }, [principalNum, interestRateNum, installmentsCountNum, interval, loanDate, customDaysNum, isCustom]);

  const totalDebt =
    principalNum > 0 ? calculateTotalDebt(principalNum, interestRateNum) : 0;

  const canSubmit =
    clientId &&
    principalNum > 0 &&
    installmentsCountNum > 0 &&
    loanDate &&
    (!isCustom || customDaysNum > 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      clientId,
      loanDate: new Date(loanDate + "T12:00:00").toISOString(),
      principal: principalNum,
      interestRate: interestRateNum,
      installmentsCount: installmentsCountNum,
      interval,
      customIntervalDays: isCustom ? customDaysNum : undefined,
      penaltyPerDay: parseFloat(penaltyPerDay) || 0,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clientId">Cliente</Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedClient?.riskLevel && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">Risco:</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getRiskLevelColor(selectedClient.riskLevel)}`}
              >
                {selectedClient.riskScore != null ? `${selectedClient.riskScore}/100 — ` : ""}
                {RISK_LEVEL_LABELS[selectedClient.riskLevel]}
              </span>
              {(selectedClient.riskLevel === "HIGH" || selectedClient.riskLevel === "VERY_HIGH") && (
                <span className="text-xs text-destructive font-medium">⚠ Atenção</span>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="loanDate">Data do empréstimo</Label>
          <Input
            id="loanDate"
            type="date"
            value={loanDate}
            onChange={(e) => setLoanDate(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Datas retroativas são permitidas
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="principal">Valor principal (R$)</Label>
          <Input
            id="principal"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="1000.00"
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
            placeholder="10"
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
            placeholder="10"
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
              placeholder="10"
              value={customIntervalDays}
              onChange={(e) => setCustomIntervalDays(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Ex: 10, 20, 45 dias entre cada parcela
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="penaltyPerDay">Multa por dia de atraso (%)</Label>
          <Input
            id="penaltyPerDay"
            type="number"
            step="0.01"
            min="0"
            placeholder="1"
            value={penaltyPerDay}
            onChange={(e) => setPenaltyPerDay(e.target.value)}
          />
        </div>
      </div>

      {totalDebt > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Principal:</span>
                <p className="font-semibold">{formatCurrency(principalNum)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Juros:</span>
                <p className="font-semibold">
                  {formatCurrency(totalDebt - principalNum)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Total:</span>
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
            <CardTitle className="text-base">Prévia das Parcelas</CardTitle>
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
        <Button type="submit" disabled={!canSubmit} isLoading={isLoading}>
          Criar Empréstimo
        </Button>
      </div>
    </form>
  );
}
