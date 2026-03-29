"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  color: string;
  update: () => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

function createParticle(width: number, height: number): Particle {
  const COLORS = ["#10b981", "#059669", "#34d399", "#065f46", "#6ee7b7", "#047857"];
  const radius = 40 + Math.random() * 70;
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];

  const p: Particle = {
    x: Math.random() * width,
    y: Math.random() * height,
    radius,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
    color,
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.x += Math.sin(Date.now() * 0.001 + this.radius) * 0.4;
      this.y += Math.cos(Date.now() * 0.001 + this.radius) * 0.4;
      if (this.x < this.radius) { this.x = this.radius; this.vx *= -0.8; }
      if (this.x > width - this.radius) { this.x = width - this.radius; this.vx *= -0.8; }
      if (this.y < this.radius) { this.y = this.radius; this.vy *= -0.8; }
      if (this.y > height - this.radius) { this.y = height - this.radius; this.vy *= -0.8; }
    },
    draw(ctx) {
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
      grad.addColorStop(0, this.color);
      grad.addColorStop(1, this.color + "00");
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.closePath();
    },
  };
  return p;
}

export function LiquidBlob() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const dimRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const PARTICLE_COUNT = 14;
    const MOUSE_RADIUS = 200;

    const resize = () => {
      const parent = canvas.parentElement;
      dimRef.current.w = parent ? parent.offsetWidth : window.innerWidth;
      dimRef.current.h = parent ? parent.offsetHeight : window.innerHeight;
      canvas.width = dimRef.current.w;
      canvas.height = dimRef.current.h;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

      particlesRef.current.forEach((p) => {
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          const angle = Math.atan2(dy, dx);
          const force = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * 0.6;
          p.vx += Math.cos(angle) * force;
          p.vy += Math.sin(angle) * force;
          p.vx *= 0.95;
          p.vy *= 0.95;
        }
      });
    };

    const onTouchMove = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    };

    const onClick = () => {
      particlesRef.current.forEach((p) => {
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS * 2) {
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * 15;
          p.vy += Math.sin(angle) * 15;
        }
      });
    };

    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("click", onClick);

    resize();

    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () =>
      createParticle(dimRef.current.w, dimRef.current.h)
    );

    const animate = () => {
      ctx.clearRect(0, 0, dimRef.current.w, dimRef.current.h);
      particlesRef.current.forEach((p) => {
        p.update();
        p.draw(ctx);
      });
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("click", onClick);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      className="absolute inset-0 w-full h-full overflow-hidden"
      aria-hidden="true"
      style={{ contain: "strict" }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-crosshair"
        style={{ filter: "blur(28px) contrast(13)", opacity: 0.7 }}
      />
    </div>
  );
}
