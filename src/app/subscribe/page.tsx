"use client";

import * as React from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SimpleTopbar } from "@/components/app/simple-topbar";
import { usePublicPlans, type PublicPlan } from "@/hooks/use-public-plans";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, CreditCard, Lock, Shield, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

interface PlanFeature {
  name: string;
  included?: boolean | null;
}

interface Plan {
  id: string;
  name: string;
  description?: string | null;
  priceMonthlyCents?: number | null;
  badge?: string | null;
  highlight?: boolean;
  features?: PlanFeature[] | null;
  ctaType?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
}

export default function SubscribePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-background via-background to-muted/30">
      <SimpleTopbar />
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-4 text-xs font-medium px-3 py-1">
            GG Empréstimos
          </Badge>
          <h1 className="text-4xl font-bold mb-3 tracking-tight">
            Acesso à plataforma
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto text-base">
            Assine o plano mensal e tenha controle total dos seus empréstimos, clientes, parcelas e cobranças.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <Pillar icon={Zap} title="Acesso Imediato" desc="Comece a usar agora mesmo" />
          <Pillar icon={Shield} title="Pagamento Seguro" desc="PIX, Boleto ou Cartão" />
          <Pillar icon={Sparkles} title="Sem Fidelidade" desc="Cancele quando quiser" />
        </div>

        <PlanCards />

        <p className="text-center text-xs text-muted-foreground mt-8">
          Ao assinar, você concorda com nossos termos de serviço e política de privacidade.
        </p>
      </main>
    </div>
  );
}

function Pillar({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-card border">
      <div className="p-2 rounded-full bg-primary/10 shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function PlanCards() {
  const { data, isLoading } = usePublicPlans();

  if (isLoading) {
    return <Skeleton className="h-72 w-full rounded-2xl" />;
  }

  // Show only paid plans (>= R$ 5,00) on the subscribe page.
  // Free plan access is managed by admin whitelist only.
  const plans: PublicPlan[] = (data?.plans ?? []).filter((p: PublicPlan) => {
    const cents = p.priceMonthlyCents;
    return cents !== null && cents !== undefined && cents >= 500;
  });

  if (!plans.length) {
    return (
      <Card className="text-center py-10">
        <CardContent>
          <p className="text-muted-foreground">Nenhum plano disponível no momento.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {plans.map((plan: PublicPlan) => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}

function PlanCard({ plan }: { plan: PublicPlan }) {
  const price = plan.priceMonthlyCents
    ? `R$ ${(plan.priceMonthlyCents / 100).toFixed(2).replace(".", ",")}`
    : "Gratuito";

  const features: PlanFeature[] = Array.isArray(plan.features) ? plan.features : [];

  return (
    <Card className={`relative overflow-hidden transition-all border-2 ${plan.highlight ? "border-primary shadow-lg shadow-primary/10" : "border-border"}`}>
      {plan.badge && (
        <div className="absolute top-4 right-4">
          <Badge className="bg-primary text-primary-foreground text-xs">{plan.badge}</Badge>
        </div>
      )}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Plano {plan.name}
            </CardTitle>
            {plan.description && (
              <CardDescription className="mt-1 max-w-lg">{plan.description}</CardDescription>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-3xl font-bold">{price}</p>
            {plan.priceMonthlyCents ? <p className="text-xs text-muted-foreground">por mês</p> : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {features.length > 0 && (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className={`h-4 w-4 shrink-0 ${f.included ? "text-primary" : "text-muted-foreground opacity-40"}`} />
                <span className={f.included ? "" : "line-through text-muted-foreground opacity-50"}>{f.name}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="pt-2">
          {plan.ctaType === "checkout" ? (
            <CheckoutButton plan={plan} />
          ) : plan.ctaUrl ? (
            <Button className="w-full" size="lg" asChild>
              <Link href={plan.ctaUrl}>{plan.ctaLabel || "Entrar em contato"}</Link>
            </Button>
          ) : (
            <Button className="w-full" size="lg" disabled>
              <Lock className="h-4 w-4 mr-2" />
              {plan.ctaLabel || "Contato"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CheckoutButton({ plan }: { plan: PublicPlan }) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [cpfCnpj, setCpfCnpj] = React.useState("");

  const formatDoc = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 14);
    if (digits.length <= 11) {
      return digits
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return digits
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  };

  const handleCheckout = async () => {
    const cleanDoc = cpfCnpj.replace(/\D/g, "");
    if (!cleanDoc || (cleanDoc.length !== 11 && cleanDoc.length !== 14)) {
      setError("Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, cpfCnpj: cleanDoc, billingType: "UNDEFINED" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.success) {
        window.location.href = "/dashboard";
      } else {
        setError(data.error || "Erro ao processar. Tente novamente.");
      }
    } catch {
      setError("Erro ao processar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">CPF ou CNPJ do titular</label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="000.000.000-00"
          value={cpfCnpj}
          onChange={(e) => setCpfCnpj(formatDoc(e.target.value))}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <Button className="w-full" size="lg" onClick={handleCheckout} disabled={loading}>
        {loading ? "Aguarde…" : plan.ctaLabel || `Assinar por ${plan.priceMonthlyCents ? `R$ ${(plan.priceMonthlyCents / 100).toFixed(2).replace(".", ",")}` : "—"}/mês`}
      </Button>
      {error && <p className="text-sm text-destructive text-center">{error}</p>}
    </div>
  );
}
