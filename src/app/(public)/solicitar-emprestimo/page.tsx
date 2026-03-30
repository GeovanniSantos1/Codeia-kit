"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2, User, Briefcase, DollarSign, Shield, ArrowLeft, Loader2,
} from "lucide-react";
import { PublicHeader } from "@/components/app/public-header";

type FormData = {
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  address: string;
  isClt: boolean;
  companyName: string;
  companyCnpj: string;
  jobPosition: string;
  monthlyIncome: string;
  occupation: string;
  loanAmount: string;
  loanPurpose: string;
  loanTermMonths: string;
  guaranteeDescription: string;
};

const initialForm: FormData = {
  fullName: "", email: "", phone: "", cpf: "", birthDate: "", address: "",
  isClt: false,
  companyName: "", companyCnpj: "", jobPosition: "", monthlyIncome: "", occupation: "",
  loanAmount: "", loanPurpose: "", loanTermMonths: "",
  guaranteeDescription: "",
};

function formatCPF(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

function formatCNPJ(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d)/, "($1) $2-$3");
  }
  return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
}

function SectionHeader({ icon: Icon, title, color }: { icon: React.ElementType; title: string; color: string }) {
  return (
    <div className={`flex items-center gap-2 mb-4 pb-2 border-b`}>
      <div className={`p-1.5 rounded-lg ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <h2 className="font-semibold text-base">{title}</h2>
    </div>
  );
}

export default function SolicitarEmprestimoPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (field: keyof FormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      const res = await fetch("/api/public/loan-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors(data.errors || ["Erro ao enviar. Tente novamente."]);
        return;
      }

      setSubmitted(true);
    } catch {
      setErrors(["Erro de conexão. Tente novamente."]);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-dvh bg-background">
        <PublicHeader />
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
          <div className="p-5 rounded-full bg-green-100 dark:bg-green-950 mb-6">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Solicitação Enviada!</h1>
          <p className="text-muted-foreground max-w-md mb-2">
            Recebemos sua solicitação de empréstimo. Nossa equipe irá analisar suas informações e entrar em contato em breve.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Fique de olho no seu e-mail <strong>{form.email}</strong>.
          </p>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao início
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <PublicHeader />
      <main className="container mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 text-center">
          <Badge variant="outline" className="mb-3 text-xs px-3 py-1">GG Empréstimos</Badge>
          <h1 className="text-3xl font-bold mb-2">Solicitar Empréstimo</h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            Preencha o formulário abaixo com suas informações. Sua solicitação será analisada e responderemos o mais breve possível.
          </p>
        </div>

        {errors.length > 0 && (
          <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="font-medium text-destructive text-sm mb-1">Corrija os erros abaixo:</p>
            <ul className="list-disc list-inside space-y-0.5">
              {errors.map((err, i) => (
                <li key={i} className="text-sm text-destructive">{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <Card>
            <CardHeader className="pb-2">
              <SectionHeader icon={User} title="Dados Pessoais" color="bg-blue-500" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="fullName">Nome Completo *</Label>
                <Input id="fullName" placeholder="Seu nome completo" value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cpf">CPF *</Label>
                <Input id="cpf" placeholder="000.000.000-00" value={form.cpf}
                  onChange={(e) => set("cpf", formatCPF(e.target.value))} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="birthDate">Data de Nascimento *</Label>
                <Input id="birthDate" type="date" value={form.birthDate}
                  onChange={(e) => set("birthDate", e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail *</Label>
                <Input id="email" type="email" placeholder="seu@email.com" value={form.email}
                  onChange={(e) => set("email", e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone / WhatsApp *</Label>
                <Input id="phone" placeholder="(00) 90000-0000" value={form.phone}
                  onChange={(e) => set("phone", formatPhone(e.target.value))} required />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="address">Endereço</Label>
                <Input id="address" placeholder="Rua, número, bairro, cidade - UF" value={form.address}
                  onChange={(e) => set("address", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Employment Info */}
          <Card>
            <CardHeader className="pb-2">
              <SectionHeader icon={Briefcase} title="Situação Profissional" color="bg-violet-500" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/30">
                <div>
                  <p className="font-medium text-sm">Sou trabalhador CLT (carteira assinada)</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {form.isClt ? "Sim — preencha os dados da empresa" : "Não — informe sua ocupação atual"}
                  </p>
                </div>
                <Switch
                  checked={form.isClt}
                  onCheckedChange={(v) => set("isClt", v)}
                />
              </div>

              {form.isClt ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="companyName">Nome da Empresa *</Label>
                    <Input id="companyName" placeholder="Razão social da empresa" value={form.companyName}
                      onChange={(e) => set("companyName", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="companyCnpj">CNPJ da Empresa</Label>
                    <Input id="companyCnpj" placeholder="00.000.000/0000-00" value={form.companyCnpj}
                      onChange={(e) => set("companyCnpj", formatCNPJ(e.target.value))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="jobPosition">Cargo / Função</Label>
                    <Input id="jobPosition" placeholder="Ex: Auxiliar Administrativo" value={form.jobPosition}
                      onChange={(e) => set("jobPosition", e.target.value)} />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="occupation">Ocupação / Atividade *</Label>
                  <Input id="occupation"
                    placeholder="Ex: Autônomo, MEI, Vendedor ambulante, Aposentado, Do lar…"
                    value={form.occupation}
                    onChange={(e) => set("occupation", e.target.value)} />
                  <p className="text-xs text-muted-foreground">Descreva sua atividade principal ou fonte de renda</p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="monthlyIncome">Renda Mensal Aproximada *</Label>
                <Input id="monthlyIncome" placeholder="Ex: R$ 2.500,00" value={form.monthlyIncome}
                  onChange={(e) => set("monthlyIncome", e.target.value)} required />
              </div>
            </CardContent>
          </Card>

          {/* Loan Details */}
          <Card>
            <CardHeader className="pb-2">
              <SectionHeader icon={DollarSign} title="Dados do Empréstimo" color="bg-green-600" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="loanAmount">Valor Desejado *</Label>
                <Input id="loanAmount" placeholder="Ex: R$ 5.000,00" value={form.loanAmount}
                  onChange={(e) => set("loanAmount", e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="loanTermMonths">Prazo para Pagamento</Label>
                <Select value={form.loanTermMonths} onValueChange={(v) => set("loanTermMonths", v)}>
                  <SelectTrigger id="loanTermMonths">
                    <SelectValue placeholder="Selecione o prazo" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,9,12,18,24,36,48,60].map((m) => (
                      <SelectItem key={m} value={String(m)}>
                        {m} {m === 1 ? "mês" : "meses"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="loanPurpose">Finalidade do Empréstimo *</Label>
                <Textarea id="loanPurpose" placeholder="Descreva para qual finalidade precisa do dinheiro. Ex: quitar dívidas, reforma, capital de giro, emergência médica…"
                  rows={3} value={form.loanPurpose}
                  onChange={(e) => set("loanPurpose", e.target.value)} required />
              </div>
            </CardContent>
          </Card>

          {/* Guarantee */}
          <Card>
            <CardHeader className="pb-2">
              <SectionHeader icon={Shield} title="Garantia do Empréstimo" color="bg-orange-500" />
              <CardDescription className="text-xs mt-1">
                Informe o que você pode oferecer como garantia. Pode ser um bem, veículo, imóvel, avalista, ou qualquer outra forma de garantia que você tenha disponível.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <Label htmlFor="guaranteeDescription">Descrição da Garantia *</Label>
                <Textarea id="guaranteeDescription"
                  placeholder="Descreva sua(s) garantia(s). Ex: Possuo um carro modelo 2020 quitado, um imóvel no nome, ou tenho um avalista com renda comprovada…"
                  rows={4} value={form.guaranteeDescription}
                  onChange={(e) => set("guaranteeDescription", e.target.value)} required />
              </div>

              <div className="mt-4 rounded-lg border bg-muted/30 p-3">
                <p className="text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">Exemplos de garantia aceitos</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    "Veículo quitado",
                    "Imóvel no nome",
                    "Avalista com renda",
                    "Equipamentos",
                    "Moto quitada",
                    "Outro bem móvel",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <p className="text-xs text-muted-foreground max-w-sm">
              Ao enviar, você concorda que suas informações serão usadas exclusivamente para análise do crédito.
            </p>
            <Button type="submit" size="lg" className="w-full sm:w-auto min-w-[200px]" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando…
                </>
              ) : "Enviar Solicitação"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
