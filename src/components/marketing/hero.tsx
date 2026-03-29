"use client";
import React from 'react'
import Link from 'next/link'
import { ArrowRight, DollarSign, Users, BarChart3, MessageSquare, Shield, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { LiquidBlob } from '@/components/marketing/liquid-blob'

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: 'blur(12px)',
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        type: 'spring' as const,
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
} as const

export function Hero() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&family=Rajdhani:wght@500;700&display=swap');

        .hero-title-avengers {
          font-family: 'Oswald', sans-serif;
          font-style: italic;
          font-weight: 700;
          animation: hero-glow-pulse 3s infinite alternate;
        }

        .hero-desc-avengers {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 500;
          border-left: 3px solid #00f2ff;
          padding-left: 16px;
          text-shadow: 0 0 4px rgba(255,255,255,0.15);
        }

        @keyframes hero-glow-pulse {
          0%   { text-shadow: 0 0 6px rgba(255,255,255,0.4), 0 0 16px rgba(6,182,212,0.3); }
          100% { text-shadow: 0 0 12px rgba(255,255,255,0.85), 0 0 32px rgba(6,182,212,0.7), 0 0 55px rgba(6,182,212,0.4); }
        }
      `}</style>

      <main className="overflow-hidden">
        <section className="relative min-h-screen">
          {/* Liquid Blob background — sits behind content */}
          <LiquidBlob />

          <div className="relative z-10 pt-24 md:pt-36">
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: { delayChildren: 1 },
                  },
                },
                item: {
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { type: 'spring' as const, bounce: 0.3, duration: 2 },
                  },
                },
              }}
              className="absolute inset-0 -z-10">
              <div className="absolute inset-x-0 top-56 -z-10 hidden lg:top-32 lg:block">
                <div className="mx-auto h-[32rem] max-w-5xl rounded-full bg-[radial-gradient(75%_60%_at_50%_40%,rgba(161,161,170,0.14),rgba(39,39,42,0))] dark:bg-[radial-gradient(75%_60%_at_50%_40%,rgba(113,113,122,0.18),rgba(24,24,27,0))]" />
              </div>
            </AnimatedGroup>

            <div aria-hidden className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]" />

            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                <AnimatedGroup variants={transitionVariants}>
                  <Link
                    href="/sign-up"
                    className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-black/5 transition-all duration-300 dark:border-t-white/5 dark:shadow-zinc-950">
                    <span className="text-foreground text-sm">Chega de planilhas. Comece agora.</span>
                    <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>
                    <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                      <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                        <span className="flex size-6"><ArrowRight className="m-auto size-3" /></span>
                        <span className="flex size-6"><ArrowRight className="m-auto size-3" /></span>
                      </div>
                    </div>
                  </Link>

                  <h1 className="hero-title-avengers mt-8 max-w-4xl mx-auto text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                    Gestão de Empréstimos Simples e Segura
                  </h1>
                  <p className="hero-desc-avengers mx-auto mt-8 max-w-2xl text-balance text-lg">
                    Substitua sua planilha por uma plataforma completa. Controle clientes, parcelas, juros, multas e fluxo de caixa — com alertas de vencimento e cobrança via WhatsApp.
                  </p>
                </AnimatedGroup>

                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: { staggerChildren: 0.05, delayChildren: 0.75 },
                      },
                    },
                    ...transitionVariants,
                  }}
                  className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
                  <div className="bg-foreground/10 rounded-[14px] border p-0.5">
                    <Button asChild size="lg" className="rounded-xl px-5 text-base">
                      <Link href="/sign-up">
                        <span className="text-nowrap">Criar conta grátis</span>
                      </Link>
                    </Button>
                  </div>
                  <Button asChild size="lg" variant="ghost" className="h-10.5 rounded-xl px-5">
                    <Link href="#pricing">
                      <span className="text-nowrap">Ver preços</span>
                    </Link>
                  </Button>
                </AnimatedGroup>
              </div>
            </div>

            <AnimatedGroup
              variants={{
                container: {
                  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.75 } },
                },
                ...transitionVariants,
              }}>
              <div className="relative mt-8 overflow-hidden px-2 sm:mt-12 md:mt-20">
                <div aria-hidden className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-35%" />
                <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-8 shadow-lg shadow-zinc-950/15 ring-1">
                  <div className="grid gap-6 md:grid-cols-3">
                    {[
                      { icon: Users, title: "Clientes", desc: "Cadastro completo com dados bancários e PIX" },
                      { icon: DollarSign, title: "Empréstimos", desc: "Até 30 parcelas com juros e multa automáticos" },
                      { icon: BarChart3, title: "Dashboard", desc: "Métricas de fluxo de caixa em tempo real" },
                      { icon: Clock, title: "Alertas", desc: "Vencimentos do dia e inadimplentes" },
                      { icon: MessageSquare, title: "WhatsApp", desc: "Cobrança com mensagem pré-preenchida" },
                      { icon: Shield, title: "Segurança", desc: "Dados isolados por conta com login seguro" },
                    ].map((f) => (
                      <div key={f.title} className="flex items-start gap-3 rounded-lg border p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <f.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{f.title}</h3>
                          <p className="text-sm text-muted-foreground">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>
      </main>
    </>
  )
}
