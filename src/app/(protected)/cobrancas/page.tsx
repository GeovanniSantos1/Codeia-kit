"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api-client";
import { useSetPageMetadata } from "@/contexts/page-metadata";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShieldAlert,
  Bell,
  MessageSquare,
  CheckCircle2,
  Clock,
  PhoneOff,
} from "lucide-react";
import {
  buildMessage,
  buildWhatsAppUrl,
  NotificationTemplateType,
} from "@/lib/collections/templates";

type LastNotification = {
  type: string;
  sentAt: string;
};

type CollectionItem = {
  id: string;
  number: number;
  dueDate: string;
  amount: number;
  penalty?: number;
  daysUntilDue?: number;
  daysOverdue?: number;
  group: string;
  clientId: string;
  clientName: string;
  clientWhatsapp: string | null;
  loanId: string;
  lastNotification: LastNotification | null;
};

type PreventiveResponse = {
  data: {
    "1D": CollectionItem[];
    "3D": CollectionItem[];
    "7D": CollectionItem[];
  };
  total: number;
};

type ReactiveResponse = {
  data: {
    "1_3D": CollectionItem[];
    "4_7D": CollectionItem[];
    "8D_PLUS": CollectionItem[];
  };
  total: number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(dateStr));
}

function formatDateTime(dateStr: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

function LastNotificationBadge({ log }: { log: LastNotification | null }) {
  if (!log) return null;
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <CheckCircle2 className="h-3 w-3 text-green-500" />
      <span>Enviado {formatDateTime(log.sentAt)}</span>
    </div>
  );
}

function SendButton({
  item,
  templateType,
  label,
  onSent,
}: {
  item: CollectionItem;
  templateType: NotificationTemplateType;
  label: string;
  onSent: (installmentId: string) => void;
}) {
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  async function handleSend() {
    if (!item.clientWhatsapp) return;
    setSending(true);
    try {
      const message = buildMessage(templateType, {
        nome: item.clientName,
        valor: formatCurrency(item.amount),
        vencimento: formatDate(item.dueDate),
        diasAtraso: item.daysOverdue,
      });
      const url = buildWhatsAppUrl(item.clientWhatsapp, message);
      window.open(url, "_blank");

      await api.post("/api/collections/log", {
        installmentId: item.id,
        type: templateType,
      });

      onSent(item.id);
    } catch {
      toast({
        title: "Erro ao registrar envio",
        description: "O WhatsApp foi aberto, mas não foi possível salvar o registro do envio.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }

  if (!item.clientWhatsapp) {
    return (
      <div className="flex flex-col items-end gap-1">
        <Button size="sm" variant="outline" disabled className="gap-1 opacity-50">
          <MessageSquare className="h-3 w-3" />
          {label}
        </Button>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <PhoneOff className="h-3 w-3" />
          Sem WhatsApp
        </span>
      </div>
    );
  }

  return (
    <Button size="sm" variant="outline" disabled={sending} onClick={handleSend} className="gap-1">
      <MessageSquare className="h-3 w-3" />
      {label}
    </Button>
  );
}

function GroupSection({
  title,
  items,
  templateType,
  sendLabel,
  badgeVariant,
  mode,
  onSent,
}: {
  title: string;
  items: CollectionItem[];
  templateType: NotificationTemplateType;
  sendLabel: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
  mode: "preventive" | "reactive";
  onSent: (installmentId: string) => void;
}) {
  if (items.length === 0) return null;

  const daysColLabel = mode === "preventive" ? "Dias Restantes" : "Dias Atraso";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </h3>
        <Badge variant={badgeVariant}>{items.length}</Badge>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Parcela</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>{daysColLabel}</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Último envio</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((inst) => (
              <TableRow key={inst.id}>
                <TableCell className="font-medium">{inst.clientName}</TableCell>
                <TableCell>#{inst.number}</TableCell>
                <TableCell>{formatDate(inst.dueDate)}</TableCell>
                <TableCell>
                  {mode === "preventive" ? (
                    <Badge variant="secondary">
                      {inst.daysUntilDue === 0 ? "Hoje" : `${inst.daysUntilDue}d`}
                    </Badge>
                  ) : (
                    <Badge variant="destructive">{inst.daysOverdue}d</Badge>
                  )}
                </TableCell>
                <TableCell>{formatCurrency(inst.amount)}</TableCell>
                <TableCell>
                  <LastNotificationBadge log={inst.lastNotification} />
                  {!inst.lastNotification && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Nunca enviado
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <SendButton
                    item={inst}
                    templateType={templateType}
                    label={sendLabel}
                    onSent={onSent}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function PreventiveTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<PreventiveResponse>({
    queryKey: ["collections-preventive"],
    queryFn: () => api.get("/api/collections/preventive"),
  });

  function handleSent(installmentId: string) {
    queryClient.invalidateQueries({ queryKey: ["collections-preventive"] });
  }

  const groups = data?.data;
  const total = data?.total ?? 0;

  const today1D = groups?.["1D"] ?? [];
  const next3D = groups?.["3D"] ?? [];
  const next7D = groups?.["7D"] ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Vence em 24h</p>
            <p className="text-2xl font-bold text-orange-600">{today1D.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Vence em 3 dias</p>
            <p className="text-2xl font-bold text-yellow-600">{next3D.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Vence em 7 dias</p>
            <p className="text-2xl font-bold">{next7D.length}</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="h-40 bg-muted animate-pulse rounded" />
      ) : total === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Nenhuma parcela próxima do vencimento.
        </p>
      ) : (
        <div className="space-y-6">
          <GroupSection
            title="Vence em 24 horas"
            items={today1D}
            templateType="PREVENTIVE_1D"
            sendLabel="Lembrar"
            badgeVariant="destructive"
            mode="preventive"
            onSent={handleSent}
          />
          <GroupSection
            title="Vence em 3 dias"
            items={next3D}
            templateType="PREVENTIVE_3D"
            sendLabel="Lembrar"
            badgeVariant="default"
            mode="preventive"
            onSent={handleSent}
          />
          <GroupSection
            title="Vence em 7 dias"
            items={next7D}
            templateType="PREVENTIVE_7D"
            sendLabel="Lembrar"
            badgeVariant="secondary"
            mode="preventive"
            onSent={handleSent}
          />
        </div>
      )}
    </div>
  );
}

function ReactiveTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<ReactiveResponse>({
    queryKey: ["collections-reactive"],
    queryFn: () => api.get("/api/collections/reactive"),
  });

  function handleSent(installmentId: string) {
    queryClient.invalidateQueries({ queryKey: ["collections-reactive"] });
  }

  const groups = data?.data;
  const total = data?.total ?? 0;

  const g1_3 = groups?.["1_3D"] ?? [];
  const g4_7 = groups?.["4_7D"] ?? [];
  const g8plus = groups?.["8D_PLUS"] ?? [];

  const totalPenalty = [...g1_3, ...g4_7, ...g8plus].reduce(
    (sum, i) => sum + (i.penalty ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">1–3 dias de atraso</p>
            <p className="text-2xl font-bold text-yellow-600">{g1_3.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">4–7 dias de atraso</p>
            <p className="text-2xl font-bold text-orange-600">{g4_7.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">8+ dias de atraso</p>
            <p className="text-2xl font-bold text-red-600">{g8plus.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total em multas</p>
            <p className="text-2xl font-bold text-red-700">{formatCurrency(totalPenalty)}</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="h-40 bg-muted animate-pulse rounded" />
      ) : total === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Nenhuma parcela em atraso. 🎉
        </p>
      ) : (
        <div className="space-y-6">
          <GroupSection
            title="1 a 3 dias de atraso"
            items={g1_3}
            templateType="REACTIVE_1_3D"
            sendLabel="Cobrar"
            badgeVariant="default"
            mode="reactive"
            onSent={handleSent}
          />
          <GroupSection
            title="4 a 7 dias de atraso"
            items={g4_7}
            templateType="REACTIVE_4_7D"
            sendLabel="Cobrar"
            badgeVariant="destructive"
            mode="reactive"
            onSent={handleSent}
          />
          <GroupSection
            title="8 ou mais dias de atraso"
            items={g8plus}
            templateType="REACTIVE_8D_PLUS"
            sendLabel="Cobrar Urgente"
            badgeVariant="destructive"
            mode="reactive"
            onSent={handleSent}
          />
        </div>
      )}
    </div>
  );
}

export default function CobrancasPage() {
  useSetPageMetadata({
    title: "Cobranças",
    description: "Gestão de cobranças preventivas e reativas",
    breadcrumbs: [
      { label: "Início", href: "/dashboard" },
      { label: "Cobranças" },
    ],
  });

  const [activeTab, setActiveTab] = useState<"preventiva" | "reativa">("preventiva");

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("preventiva")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "preventiva"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Preventiva
          </span>
        </button>
        <button
          onClick={() => setActiveTab("reativa")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "reativa"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Reativa
          </span>
        </button>
      </div>

      {activeTab === "preventiva" ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-500" />
              Cobranças Preventivas
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Avise os clientes antes do vencimento para evitar atrasos.
            </p>
          </CardHeader>
          <CardContent>
            <PreventiveTab />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              Cobranças Reativas
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Parcelas vencidas — acione os clientes para regularizar a situação.
            </p>
          </CardHeader>
          <CardContent>
            <ReactiveTab />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
