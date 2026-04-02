"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TicketCheck, Plus, Ban, Trash2, CalendarClock, ShieldCheck, Clock,
} from "lucide-react";
import { toast } from "sonner";

interface AccessInvite {
  id: string;
  email: string;
  planLabel: string | null;
  notes: string | null;
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  computedStatus: "ACTIVE" | "REVOKED" | "EXPIRED";
  expiresAt: string | null;
  grantedBy: string;
  revokedBy: string | null;
  revokedAt: string | null;
  createdAt: string;
}

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ACTIVE: { label: "Ativo", variant: "default" },
  REVOKED: { label: "Revogado", variant: "destructive" },
  EXPIRED: { label: "Expirado", variant: "secondary" },
};

function useInvites() {
  return useQuery<{ invites: AccessInvite[] }>({
    queryKey: ["admin", "invites"],
    queryFn: async () => {
      const res = await fetch("/api/admin/invites");
      if (!res.ok) throw new Error("Falha ao carregar convites");
      return res.json();
    },
  });
}

function useCreateInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      email: string;
      planLabel: string;
      notes: string;
      expiresAt: string | null;
    }) => {
      const res = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Falha ao criar convite");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "invites"] });
      toast.success("Convite de acesso criado com sucesso");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

function useRevokeInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/invites/${id}`, { method: "PATCH" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Falha ao revogar convite");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "invites"] });
      toast.success("Convite revogado — usuário perderá acesso no próximo login");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

function useDeleteInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/invites/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao excluir convite");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "invites"] });
      toast.success("Convite excluído");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

function fmt(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function fmtDatetime(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function ConvitesPage() {
  const { data, isLoading } = useInvites();
  const createMutation = useCreateInvite();
  const revokeMutation = useRevokeInvite();
  const deleteMutation = useDeleteInvite();

  const [email, setEmail] = useState("");
  const [planLabel, setPlanLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [revokeTarget, setRevokeTarget] = useState<AccessInvite | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AccessInvite | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    createMutation.mutate(
      {
        email: email.trim(),
        planLabel: planLabel.trim(),
        notes: notes.trim(),
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      },
      {
        onSuccess: () => {
          setEmail("");
          setPlanLabel("");
          setNotes("");
          setExpiresAt("");
        },
      }
    );
  };

  const invites = data?.invites ?? [];
  const activeCount = invites.filter((i) => i.computedStatus === "ACTIVE").length;
  const revokedCount = invites.filter((i) => i.computedStatus === "REVOKED").length;
  const expiredCount = invites.filter((i) => i.computedStatus === "EXPIRED").length;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TicketCheck className="h-6 w-6 text-primary" />
            Convites de Acesso
          </h1>
          <p className="text-muted-foreground mt-1">
            Libere acesso à plataforma para usuários sem exigir pagamento imediato. Gerencie, revogue e controle todos os acessos concedidos.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Ativos", value: activeCount, icon: ShieldCheck, color: "text-green-500" },
            { label: "Revogados", value: revokedCount, icon: Ban, color: "text-destructive" },
            { label: "Expirados", value: expiredCount, icon: Clock, color: "text-muted-foreground" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="pt-5 flex items-center gap-3">
                <Icon className={`h-8 w-8 ${color}`} />
                <div>
                  <p className="text-2xl font-bold">{isLoading ? "—" : value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Plus className="h-4 w-4" />
                Novo Convite
              </CardTitle>
              <CardDescription>
                O usuário terá acesso ao sistema assim que se cadastrar com este e-mail.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="inv-email">E-mail *</Label>
                  <Input
                    id="inv-email"
                    type="email"
                    placeholder="usuario@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={createMutation.isPending}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inv-plan">Plano / Rótulo (opcional)</Label>
                  <Input
                    id="inv-plan"
                    placeholder="Ex: Pro, Beta Tester, Parceiro…"
                    value={planLabel}
                    onChange={(e) => setPlanLabel(e.target.value)}
                    disabled={createMutation.isPending}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inv-expires">
                    <CalendarClock className="inline h-3.5 w-3.5 mr-1" />
                    Validade (opcional)
                  </Label>
                  <Input
                    id="inv-expires"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    disabled={createMutation.isPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe em branco para acesso por tempo indeterminado.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inv-notes">Observação interna (opcional)</Label>
                  <Textarea
                    id="inv-notes"
                    placeholder="Ex: parceiro comercial, cortesia de indicação…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={createMutation.isPending}
                    rows={2}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Criando…" : "Criar Convite de Acesso"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4" />
                Como funciona
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Convite Ativo:</strong> o usuário acessa a plataforma normalmente, mesmo sem ter pago. O sistema reconhece o e-mail no login.
              </p>
              <p>
                <strong className="text-foreground">Validade:</strong> se definir uma data de expiração, o acesso cessa automaticamente após esse prazo. Sem validade = acesso permanente até revogar.
              </p>
              <p>
                <strong className="text-foreground">Revogar:</strong> bloqueia o acesso imediatamente. O usuário será redirecionado para a página de assinatura no próximo acesso.
              </p>
              <p>
                <strong className="text-foreground">Plano / Rótulo:</strong> texto informativo que aparece no painel do usuário em "Plano: …" para identificar o tipo de acesso concedido.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Todos os Convites</CardTitle>
            <CardDescription>
              {isLoading ? "Carregando…" : `${invites.length} convite(s) registrado(s)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : invites.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <TicketCheck className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>Nenhum convite criado ainda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Observação</TableHead>
                      <TableHead className="w-[100px] text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invites.map((inv) => {
                      const badge = STATUS_BADGE[inv.computedStatus] ?? STATUS_BADGE.ACTIVE;
                      return (
                        <TableRow key={inv.id}>
                          <TableCell className="font-medium">{inv.email}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {inv.planLabel || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={badge.variant}>{badge.label}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {inv.expiresAt ? (
                              <Tooltip>
                                <TooltipTrigger className="underline decoration-dotted cursor-help">
                                  {fmt(inv.expiresAt)}
                                </TooltipTrigger>
                                <TooltipContent>
                                  {fmtDatetime(inv.expiresAt)}
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span className="text-xs">Indeterminado</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {fmt(inv.createdAt)}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                            {inv.notes ? (
                              <Tooltip>
                                <TooltipTrigger className="underline decoration-dotted cursor-help truncate max-w-[180px] block">
                                  {inv.notes}
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs whitespace-pre-wrap">
                                  {inv.notes}
                                </TooltipContent>
                              </Tooltip>
                            ) : "—"}
                            {inv.revokedAt && (
                              <span className="block text-xs text-destructive mt-0.5">
                                Revogado em {fmt(inv.revokedAt)}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              {inv.computedStatus === "ACTIVE" && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-yellow-600 hover:text-yellow-700"
                                      onClick={() => setRevokeTarget(inv)}
                                      disabled={revokeMutation.isPending}
                                    >
                                      <Ban className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Revogar acesso</TooltipContent>
                                </Tooltip>
                              )}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => setDeleteTarget(inv)}
                                    disabled={deleteMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Excluir registro</TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={!!revokeTarget} onOpenChange={(o) => !o && setRevokeTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revogar acesso</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja revogar o acesso de{" "}
                <strong>{revokeTarget?.email}</strong>? O usuário perderá acesso à plataforma no próximo login e precisará assinar um plano pago.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                onClick={() => {
                  if (revokeTarget) {
                    revokeMutation.mutate(revokeTarget.id);
                    setRevokeTarget(null);
                  }
                }}
              >
                Revogar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir convite</AlertDialogTitle>
              <AlertDialogDescription>
                Excluir o registro de <strong>{deleteTarget?.email}</strong>?
                {deleteTarget?.computedStatus === "ACTIVE" && (
                  <span className="block mt-2 text-destructive font-medium">
                    ⚠ Este convite ainda está ativo — excluir também removerá o acesso do usuário.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={() => {
                  if (deleteTarget) {
                    deleteMutation.mutate(deleteTarget.id);
                    setDeleteTarget(null);
                  }
                }}
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
