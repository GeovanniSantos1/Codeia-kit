"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { SignIn } from "@clerk/nextjs";
import { Radio } from "lucide-react";

// ─── Audio Engine ────────────────────────────────────────────────────────────

class AudioSynth {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private isInit = false;

  init() {
    if (this.isInit) return;
    const AC = (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ?? AudioContext;
    this.ctx = new AC();
    this.isInit = true;
  }

  playDrone(intensity: number) {
    if (!this.isInit) this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    if (!this.osc) {
      this.osc = this.ctx.createOscillator();
      this.gainNode = this.ctx.createGain();
      this.lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();

      this.osc.type = "sawtooth";
      this.lfo.type = "sine";
      this.lfo.frequency.value = 10;
      lfoGain.gain.value = 500;

      this.osc.connect(this.gainNode);
      this.lfo.connect(lfoGain);
      lfoGain.connect(this.osc.frequency);
      this.gainNode.connect(this.ctx.destination);
      this.osc.start();
      this.lfo.start();
      this.gainNode.gain.value = 0;
    }

    const now = this.ctx.currentTime;
    this.osc.frequency.setTargetAtTime(50 + intensity * 80, now, 0.1);
    this.gainNode!.gain.setTargetAtTime(intensity * 0.05, now, 0.1);
  }

  stop() {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
    }
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  size: number;
  color: string;
  life: number;
  decay: number;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function QuantumSignIn() {
  const containerRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<AudioSynth>(new AudioSynth());

  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [rotData, setRotData] = useState({ x: 0, y: 0 });

  // Particle loop
  useEffect(() => {
    if (particles.length === 0) return;
    let raf: number;
    const tick = () => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + Math.cos(p.angle) * p.speed,
            y: p.y + Math.sin(p.angle) * p.speed,
            speed: p.speed * 0.95,
            life: p.life - p.decay,
            size: p.size * 0.97,
          }))
          .filter((p) => p.life > 0 && p.size > 0.3)
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [particles.length]);

  const spawnParticles = useCallback((count = 8) => {
    const colors = ["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ffffff"];
    setParticles((prev) => [
      ...prev,
      ...Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i + Math.random(),
        x: 0,
        y: 0,
        angle: Math.random() * Math.PI * 2,
        speed: 2 + Math.random() * 6,
        size: 2 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: 0.02 + Math.random() * 0.03,
      })),
    ]);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const x = e.clientX - cx;
      const y = e.clientY - cy;
      const dist = Math.sqrt(x * x + y * y);
      const maxDist = 400;
      const intensity = Math.max(0, 1 - dist / maxDist);

      synthRef.current.playDrone(intensity);

      const rotY = (x / (rect.width / 2)) * 12;
      const rotX = -(y / (rect.height / 2)) * 12;
      setRotation({ x: rotX, y: rotY });
      setRotData({ x: rotY, y: rotX });
      setIsHovered(intensity > 0.1);
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setRotation({ x: 0, y: 0 });
    setIsHovered(false);
    synthRef.current.stop();
  }, []);

  const handleClick = useCallback(() => {
    spawnParticles(20);
  }, [spawnParticles]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030712] font-mono"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #1e293b 1px, transparent 1px),
            linear-gradient(to bottom, #1e293b 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#000_100%)] opacity-80 pointer-events-none" />

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 50%)",
          backgroundSize: "100% 2px",
        }}
      />

      {/* Ambient glow orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      {/* HUD corners */}
      <div className="absolute top-6 left-6 pointer-events-none">
        <div className="w-6 h-6 border-l-2 border-t-2 border-cyan-500/40" />
      </div>
      <div className="absolute top-6 right-6 pointer-events-none">
        <div className="w-6 h-6 border-r-2 border-t-2 border-cyan-500/40" />
      </div>
      <div className="absolute bottom-6 left-6 pointer-events-none">
        <div className="w-6 h-6 border-l-2 border-b-2 border-cyan-500/40" />
      </div>
      <div className="absolute bottom-6 right-6 pointer-events-none">
        <div className="w-6 h-6 border-r-2 border-b-2 border-cyan-500/40" />
      </div>

      {/* HUD top label */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-cyan-500/50 pointer-events-none">
        <Radio className="w-3 h-3 animate-pulse" />
        <span className="text-[9px] tracking-[0.4em]">SECURE CONNECTION ESTABLISHED</span>
      </div>

      {/* HUD data readout */}
      <div
        className={`absolute right-8 top-1/2 -translate-y-1/2 text-[9px] text-slate-600 flex flex-col gap-1 pointer-events-none transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
      >
        <span>ROT_X: {rotData.x.toFixed(1)}°</span>
        <span>ROT_Y: {rotData.y.toFixed(1)}°</span>
        <span>STATUS: {isHovered ? "ACTIVE" : "STANDBY"}</span>
      </div>

      {/* HUD rotating rings (decorative) */}
      <div
        className={`absolute w-[520px] h-[520px] rounded-full border border-dashed border-slate-800 pointer-events-none transition-all duration-700 ${isHovered ? "opacity-60 scale-100" : "opacity-20 scale-90"}`}
        style={{ animation: "spin 20s linear infinite" }}
      />
      <div
        className={`absolute w-[460px] h-[460px] rounded-full border border-slate-800/50 pointer-events-none transition-all duration-700 ${isHovered ? "opacity-40" : "opacity-10"}`}
        style={{ animation: "spin 30s linear infinite reverse" }}
      />

      {/* Crosshairs */}
      <div className={`absolute pointer-events-none transition-opacity duration-500 ${isHovered ? "opacity-30" : "opacity-10"}`}>
        <div className="absolute -top-64 left-1/2 w-px h-8 bg-cyan-500" style={{ transform: "translateX(-50%)" }} />
        <div className="absolute top-64 left-1/2 w-px h-8 bg-cyan-500" style={{ transform: "translateX(-50%) translateY(-100%)" }} />
        <div className="absolute left-[-250px] top-1/2 h-px w-8 bg-cyan-500" style={{ transform: "translateY(-50%)" }} />
        <div className="absolute right-[-250px] top-1/2 h-px w-8 bg-cyan-500" style={{ transform: "translateY(-50%) translateX(-100%)" }} />
      </div>

      {/* Particles */}
      <div className="absolute top-1/2 left-1/2 w-0 h-0 z-50 pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: p.x,
              top: p.y,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              opacity: p.life,
              transform: "translate(-50%, -50%)",
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            }}
          />
        ))}
      </div>

      {/* Main panel */}
      <div
        className="relative z-10 flex flex-col items-center gap-8"
        style={{
          transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s ease-out",
        }}
      >
        {/* Header */}
        <header className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-1">
            <div className="w-8 h-px bg-cyan-500/40" />
            <span className="text-[9px] text-cyan-500/60 tracking-[0.5em]">GG EMPRÉSTIMOS</span>
            <div className="w-8 h-px bg-cyan-500/40" />
          </div>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 tracking-tighter">
            INTERFACE DE ACESSO
          </h1>
          <p className="text-[10px] text-slate-600 tracking-widest">AUTENTICAÇÃO SEGURA · v2.0</p>
        </header>

        {/* Sign-in form card */}
        <div
          className="relative"
          style={{ filter: isHovered ? "drop-shadow(0 0 24px rgba(6,182,212,0.2))" : "none" }}
        >
          {/* Glow border */}
          <div
            className={`absolute -inset-px rounded-2xl transition-all duration-500 pointer-events-none ${isHovered ? "opacity-100" : "opacity-0"}`}
            style={{
              background: "linear-gradient(135deg, rgba(6,182,212,0.4), rgba(139,92,246,0.4), rgba(16,185,129,0.2))",
              filter: "blur(1px)",
            }}
          />

          <div className="relative bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl min-w-[340px]">
            <SignIn
              appearance={{
                variables: {
                  colorBackground: "transparent",
                  colorText: "#e2e8f0",
                  colorPrimary: "#06b6d4",
                  colorInputBackground: "#0f172a",
                  colorInputText: "#e2e8f0",
                  colorNeutral: "#64748b",
                  borderRadius: "8px",
                },
                elements: {
                  card: "bg-transparent shadow-none border-0 p-0",
                  headerTitle: "text-white font-bold tracking-wide",
                  headerSubtitle: "text-slate-400 text-xs",
                  socialButtonsBlockButton: "border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors",
                  formFieldInput: "border-slate-700 bg-slate-900/80 text-white focus:border-cyan-500 focus:ring-cyan-500/20",
                  formFieldLabel: "text-slate-400 text-xs tracking-wider uppercase",
                  formButtonPrimary: "bg-cyan-500 hover:bg-cyan-400 text-black font-bold tracking-wider transition-all",
                  footerActionLink: "text-cyan-400 hover:text-cyan-300",
                  dividerLine: "bg-slate-800",
                  dividerText: "text-slate-600 text-xs",
                  identityPreviewText: "text-slate-300",
                  identityPreviewEditButton: "text-cyan-400",
                  otpCodeFieldInput: "border-slate-700 bg-slate-900 text-white",
                  alertText: "text-red-400 text-xs",
                  formFieldSuccessText: "text-emerald-400",
                },
              }}
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              fallbackRedirectUrl="/dashboard"
            />
          </div>
        </div>

        {/* Footer */}
        <p className="text-[9px] text-slate-700 tracking-widest text-center max-w-xs">
          MOVA O MOUSE PARA ATIVAR TELEMETRIA AUDITIVA
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
