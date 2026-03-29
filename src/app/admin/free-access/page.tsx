"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Trash2, UserCheck, Plus, Mail } from "lucide-react";
import { toast } from "sonner";

interface WhitelistEntry {
  id: string;
  email: string;
  note: string | null;
  addedBy: string;
  createdAt: string;
}

function useWhitelist() {
  return useQuery<{ entries: WhitelistEntry[] }>({
    queryKey: ["admin", "free-whitelist"],
    queryFn: async () => {
      const res = await fetch("/api/admin/free-whitelist");
      if (!res.ok) throw new Error("Falha ao carregar lista");
      return res.json();
    },
  });
}

function useAddEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { email: string; note: string }) => {
      const res = await fetch("/api/admin/free-whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Falha ao adicionar");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "free-whitelist"] });
      toast.success("E-mail adicionado à lista gratuita");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

function useRemoveEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/free-whitelist/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao remover");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "free-whitelist"] });
      toast.success("E-mail removido da lista gratuita");
    },
    onError: () => {
      toast.error("Erro ao remover e-mail");
    },
  });
}

export default function FreeAccessPage() {
  const { data, isLoading } = useWhitelist();
  const addMutation = useAddEmail();
  const removeMutation = useRemoveEmail();

  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<WhitelistEntry | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    addMutation.mutate({ email: email.trim(), note: note.trim() }, {
      onSuccess: () => {
        setEmail("");
        setNote("");
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-primary" />
          Acesso Gratuito
        </h1>
        <p className="text-muted-foreground mt-1">
          E-mails nesta lista têm acesso gratuito ao sistema sem precisar assinar o plano pago.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Plus className="h-4 w-4" />
              Adicionar E-mail
            </CardTitle>
            <CardDescription>
              O usuário precisará se cadastrar com exatamente este e-mail para ter acesso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={addMutation.isPending}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="note">Observação (opcional)</Label>
                <Input
                  id="note"
                  placeholder="Ex: parceiro, beta tester…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={addMutation.isPending}
                />
              </div>
              <Button type="submit" className="w-full" disabled={addMutation.isPending}>
                {addMutation.isPending ? "Adicionando…" : "Adicionar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4" />
              Como funciona
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Plano Pago (R$ 29,90/mês):</strong> qualquer usuário que assinar tem acesso completo ao sistema, exceto o painel admin.
            </p>
            <p>
              <strong className="text-foreground">Acesso Gratuito (esta lista):</strong> apenas os e-mails cadastrados aqui podem usar o sistema gratuitamente. Demais usuários são redirecionados para a página de assinatura.
            </p>
            <p>
              <strong className="text-foreground">Admin:</strong> o painel de administração é restrito aos administradores configurados no sistema, independentemente do plano.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Acesso Gratuito</CardTitle>
          <CardDescription>
            {isLoading ? "Carregando…" : `${data?.entries?.length ?? 0} e-mail(s) cadastrado(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : !data?.entries?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserCheck className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>Nenhum e-mail cadastrado ainda.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Observação</TableHead>
                  <TableHead>Adicionado em</TableHead>
                  <TableHead className="w-[80px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">Gratuito</Badge>
                        {entry.email}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {entry.note || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(entry.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive h-8 w-8"
                        onClick={() => setDeleteTarget(entry)}
                        disabled={removeMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover acesso gratuito</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{deleteTarget?.email}</strong>? O usuário não poderá mais acessar o sistema sem assinar o plano pago.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  removeMutation.mutate(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
