"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  User, Briefcase, DollarSign, Shield, Phone, Mail, Calendar,
  MapPin, Building2, ClipboardList, CheckCircle2, XCircle, Clock, Eye,
} from "lucide-react";
import { toast } from "sonner";

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  address: string | null;
  isClt: boolean;
  companyName: string | null;
  companyCnpj: string | null;
  jobPosition: string | null;
  monthlyIncome: string;
  occupation: string | null;
  loanAmount: string;
  loanPurpose: string;
  loanTermMonths: number | null;
  guaranteeDescription: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: "Pendente",    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300", icon: Clock },
  reviewing: { label: "Em análise",  color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", icon: Eye },
  approved:  { label: "Aprovada",    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", icon: CheckCircle2 },
  rejected:  { label: "Reprovada",   color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", icon: XCircle },
};

function useApplications(status?: string) {
  return useQuery<{ applications: Application[] }>({
    queryKey: ["admin", "loan-requests", status],
    queryFn: async () => {
      const url = status ? `/api/admin/loan-requests?status=${status}` : "/api/admin/loan-requests";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Falha ao carregar");
      return res.json();
    },
  });
}

function useUpdateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, adminNote }: { id: string; status: string; adminNote?: string }) => {
      const res = await fetch(`/api/admin/loan-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "loan-requests"] });
      toast.success("Solicitação atualizada");
    },
    onError: () => toast.error("Erro ao atualizar"),
  });
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${s.color}`}>
      <s.icon className="h-3 w-3" />
      {s.label}
    </span>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <span className="text-muted-foreground text-xs">{label}: </span>
        <span className="font-medium">{value}</span>
      </div>
    </div>
  );
}

function ApplicationDetail({ app, onClose }: { app: Application; onClose: () => void }) {
  const updateMutation = useUpdateStatus();
  const [status, setStatus] = useState(app.status);
  const [note, setNote] = useState(app.adminNote || "");

  const handleSave = () => {
    updateMutation.mutate({ id: app.id, status, adminNote: note }, {
      onSuccess: onClose,
    });
  };

  const formatCPF = (c: string) => c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  const formatCNPJ = (c: string) => c.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");

  return (
    <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">{app.fullName}</h3>
          <p className="text-sm text-muted-foreground">
            Enviado em {new Date(app.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
        <StatusBadge status={app.status} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
            <User className="h-3 w-3" /> Dados Pessoais
          </p>
          <div className="space-y-1.5">
            <InfoRow icon={User} label="CPF" value={formatCPF(app.cpf)} />
            <InfoRow icon={Calendar} label="Nascimento" value={app.birthDate} />
            <InfoRow icon={Mail} label="E-mail" value={app.email} />
            <InfoRow icon={Phone} label="Telefone" value={app.phone} />
            <InfoRow icon={MapPin} label="Endereço" value={app.address} />
          </div>
        </Card>

        <Card className="p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
            <Briefcase className="h-3 w-3" /> Situação Profissional
          </p>
          <div className="space-y-1.5">
            <InfoRow icon={Briefcase} label="Tipo" value={app.isClt ? "CLT (carteira assinada)" : "Não CLT / Autônomo"} />
            {app.isClt ? (
              <>
                <InfoRow icon={Building2} label="Empresa" value={app.companyName} />
                <InfoRow icon={Building2} label="CNPJ" value={app.companyCnpj ? formatCNPJ(app.companyCnpj) : null} />
                <InfoRow icon={Briefcase} label="Cargo" value={app.jobPosition} />
              </>
            ) : (
              <InfoRow icon={Briefcase} label="Ocupação" value={app.occupation} />
            )}
            <InfoRow icon={DollarSign} label="Renda mensal" value={app.monthlyIncome} />
          </div>
        </Card>

        <Card className="p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
            <DollarSign className="h-3 w-3" /> Empréstimo
          </p>
          <div className="space-y-1.5">
            <InfoRow icon={DollarSign} label="Valor" value={app.loanAmount} />
            {app.loanTermMonths && <InfoRow icon={Calendar} label="Prazo" value={`${app.loanTermMonths} meses`} />}
            <div className="text-sm">
              <span className="text-xs text-muted-foreground">Finalidade: </span>
              <p className="mt-0.5 text-sm leading-relaxed">{app.loanPurpose}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
            <Shield className="h-3 w-3" /> Garantia
          </p>
          <p className="text-sm leading-relaxed">{app.guaranteeDescription}</p>
        </Card>
      </div>

      <Card className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1">
          <ClipboardList className="h-3 w-3" /> Análise / Decisão
        </p>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="reviewing">Em análise</SelectItem>
                <SelectItem value="approved">Aprovada</SelectItem>
                <SelectItem value="rejected">Reprovada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nota interna</label>
            <Textarea placeholder="Observações, motivo da decisão…" rows={3} value={note}
              onChange={(e) => setNote(e.target.value)} />
          </div>
          <Button className="w-full" onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Salvando…" : "Salvar Decisão"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function ApplicationCard({ app }: { app: Application }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="hover:border-primary/40 transition-colors cursor-pointer" onClick={() => setOpen(true)}>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold truncate">{app.fullName}</p>
                <StatusBadge status={app.status} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" /> {app.loanAmount}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {app.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" /> {app.isClt ? app.companyName || "CLT" : app.occupation || "Autônomo"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{app.loanPurpose}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">
                {new Date(app.createdAt).toLocaleDateString("pt-BR")}
              </p>
              <Button variant="ghost" size="sm" className="mt-1 h-7 text-xs" onClick={(e) => { e.stopPropagation(); setOpen(true); }}>
                <Eye className="h-3 w-3 mr-1" /> Ver detalhes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Solicitação de Empréstimo</DialogTitle>
          </DialogHeader>
          <ApplicationDetail app={app} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function ApplicationList({ status }: { status?: string }) {
  const { data, isLoading } = useApplications(status);

  if (isLoading) {
    return <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>;
  }

  const apps = data?.applications ?? [];
  if (!apps.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-30" />
        <p>Nenhuma solicitação {status ? `com status "${STATUS_MAP[status]?.label}"` : ""} encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {apps.map((app) => <ApplicationCard key={app.id} app={app} />)}
    </div>
  );
}

export default function LoanRequestsPage() {
  const { data: allData } = useApplications();
  const apps = allData?.applications ?? [];

  const counts = {
    all: apps.length,
    pending: apps.filter((a) => a.status === "pending").length,
    reviewing: apps.filter((a) => a.status === "reviewing").length,
    approved: apps.filter((a) => a.status === "approved").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" />
          Solicitações de Empréstimo
        </h1>
        <p className="text-muted-foreground mt-1">
          Clientes que solicitaram empréstimo pela página pública.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: "pending", label: "Pendentes", color: "text-yellow-600" },
          { key: "reviewing", label: "Em análise", color: "text-blue-600" },
          { key: "approved", label: "Aprovadas", color: "text-green-600" },
          { key: "rejected", label: "Reprovadas", color: "text-red-600" },
        ].map((s) => (
          <Card key={s.key} className="p-3 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{counts[s.key as keyof typeof counts]}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todas ({counts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pendentes ({counts.pending})</TabsTrigger>
          <TabsTrigger value="reviewing">Em análise ({counts.reviewing})</TabsTrigger>
          <TabsTrigger value="approved">Aprovadas ({counts.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Reprovadas ({counts.rejected})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4"><ApplicationList /></TabsContent>
        <TabsContent value="pending" className="mt-4"><ApplicationList status="pending" /></TabsContent>
        <TabsContent value="reviewing" className="mt-4"><ApplicationList status="reviewing" /></TabsContent>
        <TabsContent value="approved" className="mt-4"><ApplicationList status="approved" /></TabsContent>
        <TabsContent value="rejected" className="mt-4"><ApplicationList status="rejected" /></TabsContent>
      </Tabs>
    </div>
  );
}
