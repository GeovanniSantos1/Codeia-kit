"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Pencil, Trash2, MessageCircle, ArrowLeft, HandCoins,
  ShieldCheck, RefreshCw, Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePageConfig } from "@/hooks/use-page-config";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate, decimalToNumber } from "@/lib/loans/calculations";
import {
  type RiskLevel,
  type CreditBureau,
  type EmploymentType,
  type BankType,
  RISK_LEVEL_LABELS,
  CREDIT_BUREAU_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  BANK_TYPE_LABELS,
  getRiskLevelColor,
} from "@/lib/loans/risk-score";
import {
  type ClientTier,
  CLIENT_TIER_LABELS,
  CLIENT_TIER_DESCRIPTION,
  CLIENT_TIER_EMOJI,
  getTierColor,
} from "@/lib/loans/client-tier";

interface Loan {
  id: string;
  loanDate: string;
  principal: number | { toString(): string };
  interestRate: number | { toString(): string };
  installmentsCount: number;
  interval: string;
  status: string;
}

interface ClientDetail {
  id: string;
  name: string;
  whatsapp: string | null;
  cpf: string | null;
  address: string | null;
  motherName: string | null;
  pix: string | null;
  bank: string | null;
  agency: string | null;
  account: string | null;
  reserve: number | { toString(): string } | null;
  line: number | null;
  notes: string | null;
  creditBureau: CreditBureau | null;
  employmentType: EmploymentType | null;
  monthlyIncome: number | { toString(): string } | null;
  dependents: number | null;
  bankType: BankType | null;
  creditNotes: string | null;
  riskScore: number | null;
  riskLevel: RiskLevel | null;
  tier: ClientTier | null;
  loans: Loan[];
}

function whatsappLink(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  const number = digits.length <= 11 ? `55${digits}` : digits;
  return `https://wa.me/${number}`;
}

const statusLabels: Record<string, string> = {
  ACTIVE: "Ativo",
  PAID_OFF: "Quitado",
  CANCELLED: "Cancelado",
};

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "default",
  PAID_OFF: "secondary",
  CANCELLED: "destructive",
};

const intervalLabels: Record<string, string> = {
  DAILY: "Diário",
  WEEKLY: "Semanal",
  BIWEEKLY: "Quinzenal",
  MONTHLY: "Mensal",
  CUSTOM: "Personalizado",
};

function toNum(val: unknown): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return val;
  return Number(val);
}

function RiskScoreBadge({ level, score }: { level: RiskLevel | null; score: number | null }) {
  if (!level || score === null) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Não avaliado
      </Badge>
    );
  }
  const colorClass = getRiskLevelColor(level);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}>
      {score}/100 — {RISK_LEVEL_LABELS[level]}
    </span>
  );
}

const TIER_ORDER: ClientTier[] = ["INICIANTE", "MAU_PAGADOR", "BOM_PAGADOR", "OURO", "BLOQUEADO"];

function TierSection({
  client,
  onUpdated,
}: {
  client: ClientDetail;
  onUpdated: () => void;
}) {
  const [selected, setSelected] = React.useState<ClientTier>(client.tier ?? "INICIANTE");
  const [isSaving, setIsSaving] = React.useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      await api.patch(`/api/clients/${client.id}`, { tier: selected });
      toast({ title: "Nível do cliente atualizado!" });
      onUpdated();
    } catch {
      toast({ title: "Erro ao salvar nível", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }

  const tierColor = getTierColor(selected);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Define o nível de confiança deste cliente com base no seu histórico na plataforma.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {TIER_ORDER.map((t) => {
          const c = getTierColor(t);
          const isActive = selected === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setSelected(t)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all text-center cursor-pointer ${
                isActive
                  ? `${c.bg} ${c.border} ${c.text}`
                  : "border-border/40 hover:border-border"
              }`}
            >
              <span className="text-2xl">{CLIENT_TIER_EMOJI[t]}</span>
              <span className="text-xs font-semibold leading-tight">{CLIENT_TIER_LABELS[t]}</span>
            </button>
          );
        })}
      </div>

      <div className={`rounded-lg border p-3 ${tierColor.bg} ${tierColor.border}`}>
        <p className={`text-sm ${tierColor.text}`}>
          <strong>{CLIENT_TIER_EMOJI[selected]} {CLIENT_TIER_LABELS[selected]}:</strong>{" "}
          {CLIENT_TIER_DESCRIPTION[selected]}
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || selected === (client.tier ?? "INICIANTE")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Salvando..." : "Salvar Nível"}
        </button>
      </div>
    </div>
  );
}

function RiskAnalysisSection({
  client,
  onUpdated,
}: {
  client: ClientDetail;
  onUpdated: () => void;
}) {
  const [creditBureau, setCreditBureau] = React.useState<string>(client.creditBureau ?? "");
  const [employmentType, setEmploymentType] = React.useState<string>(client.employmentType ?? "");
  const [monthlyIncome, setMonthlyIncome] = React.useState<string>(
    client.monthlyIncome != null ? String(toNum(client.monthlyIncome)) : ""
  );
  const [dependents, setDependents] = React.useState<string>(
    client.dependents != null ? String(client.dependents) : ""
  );
  const [bankType, setBankType] = React.useState<string>(client.bankType ?? "");
  const [creditNotes, setCreditNotes] = React.useState<string>(client.creditNotes ?? "");
  const [isSaving, setIsSaving] = React.useState(false);
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [currentScore, setCurrentScore] = React.useState<number | null>(client.riskScore);
  const [currentLevel, setCurrentLevel] = React.useState<RiskLevel | null>(client.riskLevel);
  const [breakdown, setBreakdown] = React.useState<Record<string, number> | null>(null);

  async function handleSave(): Promise<boolean> {
    setIsSaving(true);
    try {
      await api.put(`/api/clients/${client.id}`, {
        creditBureau: creditBureau || null,
        employmentType: employmentType || null,
        monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : null,
        dependents: dependents !== "" ? parseInt(dependents) : null,
        bankType: bankType || null,
        creditNotes: creditNotes || null,
      });
      toast({ title: "Dados de risco salvos!" });
      onUpdated();
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao salvar dados";
      toast({ title: message, variant: "destructive" });
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCalculate() {
    setIsCalculating(true);
    try {
      const saved = await handleSave();
      if (!saved) {
        return;
      }
      const res = await api.post<{
        score: number;
        level: RiskLevel;
        breakdown: Record<string, number>;
      }>(`/api/clients/${client.id}/risk`, {});
      setCurrentScore(res.score);
      setCurrentLevel(res.level);
      setBreakdown(res.breakdown);
      toast({ title: `Score calculado: ${res.score}/100 — ${RISK_LEVEL_LABELS[res.level]}` });
      onUpdated();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao calcular score";
      toast({ title: message, variant: "destructive" });
    } finally {
      setIsCalculating(false);
    }
  }

  const scoreBarColor =
    currentLevel === "LOW" ? "bg-green-500"
    : currentLevel === "MEDIUM" ? "bg-yellow-500"
    : currentLevel === "HIGH" ? "bg-orange-500"
    : currentLevel === "VERY_HIGH" ? "bg-red-500"
    : "bg-muted";

  return (
    <div className="space-y-6">
      {(currentScore !== null) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Resultado do Score</span>
              <RiskScoreBadge level={currentLevel} score={currentScore} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Pontuação de Risco</span>
                <span className="font-bold">{currentScore}/100</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all ${scoreBarColor}`}
                  style={{ width: `${currentScore}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Quanto maior o score, menor o risco de inadimplência.
              </p>
            </div>
            {breakdown && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {[
                  { label: "Bureau de Crédito", key: "bureau", max: 30 },
                  { label: "Emprego", key: "employment", max: 25 },
                  { label: "Renda vs Dívida", key: "income", max: 20 },
                  { label: "Histórico na Plat.", key: "history", max: 15 },
                  { label: "Tipo de Banco", key: "bank", max: 5 },
                  { label: "Dependentes", key: "dependents", max: 5 },
                ].map(({ label, key, max }) => (
                  <div key={key} className="bg-muted/50 rounded-lg p-2 space-y-1">
                    <div className="flex justify-between font-medium">
                      <span>{label}</span>
                      <span>{breakdown[key]}/{max}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-primary"
                        style={{ width: `${(breakdown[key] / max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Situação no Bureau de Crédito</Label>
          <Select value={creditBureau} onValueChange={setCreditBureau}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CLEAN">{CREDIT_BUREAU_LABELS.CLEAN}</SelectItem>
              <SelectItem value="RESTRICTED">{CREDIT_BUREAU_LABELS.RESTRICTED}</SelectItem>
              <SelectItem value="NEGATIVE">{CREDIT_BUREAU_LABELS.NEGATIVE}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tipo de Emprego</Label>
          <Select value={employmentType} onValueChange={setEmploymentType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(EMPLOYMENT_TYPE_LABELS) as [EmploymentType, string][]).map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Renda Mensal (R$)</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="3000.00"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Número de Dependentes</Label>
          <Input
            type="number"
            min="0"
            max="20"
            placeholder="0"
            value={dependents}
            onChange={(e) => setDependents(e.target.value)}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Tipo de Banco / Conta</Label>
          <Select value={bankType} onValueChange={setBankType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(BANK_TYPE_LABELS) as [BankType, string][]).map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Observações de Crédito</Label>
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Informações adicionais sobre o histórico de crédito deste cliente..."
            value={creditNotes}
            onChange={(e) => setCreditNotes(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <p className="text-xs text-muted-foreground">
          Score baseado em dados manuais + histórico de pagamentos na plataforma.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} isLoading={isSaving} disabled={isCalculating}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Dados
          </Button>
          <Button onClick={handleCalculate} isLoading={isCalculating} disabled={isSaving}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Calcular Score
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const queryClient = useQueryClient();
  const [showDelete, setShowDelete] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () =>
      api.get<{ client: ClientDetail }>(`/api/clients/${clientId}`),
    enabled: !!clientId,
  });

  const client = data?.client;

  usePageConfig(
    client?.name || "Cliente",
    "Detalhes do cliente",
    [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Clientes", href: "/clients" },
      { label: client?.name || "Cliente" },
    ]
  );

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/api/clients/${clientId}`);
      toast({ title: "Cliente excluído com sucesso!" });
      router.push("/clients");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao excluir cliente";
      toast({ title: message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Cliente não encontrado.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/clients">Voltar para Clientes</Link>
        </Button>
      </div>
    );
  }

  const waLink = whatsappLink(client.whatsapp);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {(() => {
            const t = client.tier ?? "INICIANTE";
            const c = getTierColor(t);
            return (
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${c.badge}`}>
                {CLIENT_TIER_EMOJI[t]} {CLIENT_TIER_LABELS[t]}
              </span>
            );
          })()}
          {client.riskLevel && (
            <RiskScoreBadge level={client.riskLevel} score={client.riskScore} />
          )}
          {waLink && (
            <Button variant="outline" size="sm" asChild>
              <a href={waLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/clients/${clientId}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="tier" className="flex items-center gap-1.5">
            ⭐ Nível
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" />
            Análise de Risco
          </TabsTrigger>
          <TabsTrigger value="loans">
            Empréstimos ({client.loans.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6 pt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Nome" value={client.name} />
                <InfoRow label="CPF" value={client.cpf} />
                <InfoRow label="WhatsApp" value={client.whatsapp} />
                <InfoRow label="Nome da Mãe" value={client.motherName} />
                <InfoRow label="Endereço" value={client.address} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dados Bancários</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="PIX" value={client.pix} />
                <InfoRow label="Banco" value={client.bank} />
                <InfoRow label="Agência" value={client.agency} />
                <InfoRow label="Conta" value={client.account} />
                <InfoRow
                  label="Reserva"
                  value={
                    client.reserve != null
                      ? formatCurrency(toNum(client.reserve))
                      : null
                  }
                />
                <InfoRow
                  label="Linha"
                  value={client.line != null ? String(client.line) : null}
                />
              </CardContent>
            </Card>
          </div>

          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tier" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⭐ Nível do Cliente na Plataforma
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TierSection
                client={client}
                onUpdated={() => queryClient.invalidateQueries({ queryKey: ["client", clientId] })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Análise de Risco de Crédito
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RiskAnalysisSection
                client={client}
                onUpdated={() => queryClient.invalidateQueries({ queryKey: ["client", clientId] })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loans" className="pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <HandCoins className="h-5 w-5" />
                Empréstimos ({client.loans.length})
              </CardTitle>
              <Button size="sm" asChild>
                <Link href={`/loans/new?clientId=${clientId}`}>
                  Novo Empréstimo
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {client.loans.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum empréstimo registrado.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Principal</TableHead>
                      <TableHead>Juros</TableHead>
                      <TableHead>Parcelas</TableHead>
                      <TableHead>Intervalo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {client.loans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell>{formatDate(loan.loanDate)}</TableCell>
                        <TableCell>
                          {formatCurrency(toNum(loan.principal))}
                        </TableCell>
                        <TableCell>{toNum(loan.interestRate)}%</TableCell>
                        <TableCell>{loan.installmentsCount}x</TableCell>
                        <TableCell>
                          {intervalLabels[loan.interval] || loan.interval}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariants[loan.status] || "outline"}>
                            {statusLabels[loan.status] || loan.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/loans/${loan.id}`}>Ver</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Cliente</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {client.name}? Esta ação não pode
              ser desfeita e todos os empréstimos associados serão removidos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  );
}
