"use client";

import { useRef } from "react";

type Testimonial = {
  id: number;
  quote: string;
  author: string;
  company: string;
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "Antes eu controlava tudo em planilha e vivia com medo de perder os dados. Agora tenho tudo organizado, as parcelas são calculadas automaticamente e ainda recebo alerta quando alguém está atrasado.",
    author: "Geovanni S.",
    company: "Emprestador autônomo",
  },
  {
    id: 2,
    quote: "O módulo de cobranças via WhatsApp me economiza horas por semana. Clico em um botão e já abre a mensagem pronta para o cliente. Simples assim.",
    author: "Marcos A.",
    company: "Investidor pessoal",
  },
  {
    id: 3,
    quote: "Comecei a usar e em menos de uma semana já tinha todos os meus clientes cadastrados. O dashboard me dá uma visão clara de quanto tenho a receber e de quem.",
    author: "Cláudia R.",
    company: "Empreendedora",
  },
  {
    id: 4,
    quote: "A multa por atraso é calculada automaticamente, sem eu precisar fazer nada. Isso sozinho já valeu o investimento no sistema.",
    author: "Ricardo F.",
    company: "Prestador de serviços",
  },
  {
    id: 5,
    quote: "Finalmente um sistema feito para quem empresta dinheiro de verdade, sem complicação. Interface limpa, rápida e funciona no celular também.",
    author: "Tatiane M.",
    company: "Agente de crédito",
  },
];

function QuoteIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="opacity-40">
      <path
        d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C20.1216 16 21.017 15.1046 21.017 14V9C21.017 7.89543 20.1216 7 19.017 7H16.017C14.9124 7 14.017 7.89543 14.017 9V12M3 21L3 18C3 16.8954 3.89543 16 5 16H8C9.10457 16 10 15.1046 10 14V9C10 7.89543 9.10457 7 8 7H5C3.89543 7 3 7.89543 3 9V12"
        stroke="white"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <div className="flex-shrink-0 w-[300px] md:w-[400px] mx-4 py-4">
      <div className="relative h-full min-h-[280px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-[28px] p-8 shadow-2xl flex flex-col justify-between group hover:bg-white/15 transition-all duration-500 hover:-translate-y-2">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-[28px]" />
        <div className="relative z-10">
          <div className="mb-5">
            <QuoteIcon />
          </div>
          <p className="text-base md:text-lg text-white font-light leading-relaxed italic whitespace-normal">
            "{item.quote}"
          </p>
        </div>
        <div className="relative z-10 border-t border-white/10 pt-5 mt-6">
          <h4 className="text-white font-bold tracking-wide uppercase text-sm leading-none">
            {item.author}
          </h4>
          <p className="text-emerald-300 text-xs font-mono mt-2 uppercase tracking-[0.2em]">
            {item.company}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (marqueeRef.current) {
      marqueeRef.current.style.animationPlayState = "paused";
    }
  };

  const handleMouseLeave = () => {
    if (marqueeRef.current) {
      marqueeRef.current.style.animationPlayState = "running";
    }
  };

  const doubled = [...testimonials, ...testimonials];

  return (
    <section className="relative w-full flex flex-col justify-center overflow-hidden bg-[#070708] py-24 font-sans">
      <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-teal-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />

      <div className="relative z-10 w-full">
        <div className="container mx-auto px-6 mb-12 text-center">
          <div className="flex items-center gap-4 mb-4 justify-center">
            <div className="w-12 h-[1px] bg-emerald-500" />
            <span className="text-emerald-400 font-mono text-xs uppercase tracking-[0.4em]">
              Depoimentos
            </span>
            <div className="w-12 h-[1px] bg-emerald-500" />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter leading-tight">
            Quem usa,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-white to-teal-400">
              aprova.
            </span>
          </h2>
          <p className="mt-4 text-white/50 text-base max-w-xl mx-auto">
            Veja o que nossos clientes falam sobre o GG Empréstimos.
          </p>
        </div>

        <div className="relative w-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-24 md:w-40 bg-gradient-to-r from-[#070708] to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 md:w-40 bg-gradient-to-l from-[#070708] to-transparent z-20 pointer-events-none" />

          <div
            ref={marqueeRef}
            className="testimonials-marquee flex py-4"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {doubled.map((item, index) => (
              <TestimonialCard key={`${item.id}-${index}`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
