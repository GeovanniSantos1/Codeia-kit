'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  CreditCard,
  Users,
  HandCoins,
  ArrowLeftRight,
  MessageSquare,
  Bell,
  AlertTriangle,
  Shield,
  Megaphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, color: '#00ffcc' },
  { name: 'Clientes', href: '/clients', icon: Users, color: '#06b6d4' },
  { name: 'Empréstimos', href: '/loans', icon: HandCoins, color: '#8b5cf6' },
  {
    name: 'Lançamentos',
    href: '/transactions',
    icon: ArrowLeftRight,
    color: '#f59e0b',
  },
  { name: 'Cobranças', href: '/cobrancas', icon: Megaphone, color: '#ff0055' },
  {
    name: 'Mensagens',
    href: '/messages',
    icon: MessageSquare,
    color: '#10b981',
  },
  { name: 'Vence Hoje', href: '/alerts/today', icon: Bell, color: '#facc15' },
  {
    name: 'Inadimplentes',
    href: '/alerts/overdue',
    icon: AlertTriangle,
    color: '#ef4444',
  },
  { name: 'Assinatura', href: '/billing', icon: CreditCard, color: '#a78bfa' },
];

const adminItem = {
  name: 'Painel Admin',
  href: '/admin',
  icon: Shield,
  color: '#ff6600',
};

type NavItem = (typeof navigationItems)[0];

// ─── Expanded nav item with kinetic shard aesthetics ─────────────────────────
function KineticItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const [hovered, setHovered] = React.useState(false);
  const Icon = item.icon as React.ComponentType<{ className?: string }>;
  const lit = isActive || hovered;

  return (
    <Link
      href={item.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex items-center gap-3 rounded-md px-3 py-2 transition-all duration-300"
      style={{
        background: lit
          ? `linear-gradient(90deg, ${item.color}18, transparent 80%)`
          : 'transparent',
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] rounded-full transition-all duration-300"
        style={{
          height: isActive ? '70%' : hovered ? '45%' : '0%',
          background: item.color,
          boxShadow: lit ? `0 0 8px ${item.color}` : 'none',
        }}
      />

      {/* Glow radial */}
      {lit && (
        <div
          className="absolute inset-0 rounded-md pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 0% 50%, ${item.color}12, transparent 70%)`,
          }}
        />
      )}

      {/* Icon */}
      <Icon
        className="h-4 w-4 shrink-0 transition-colors duration-300"
        style={{ color: lit ? item.color : '#6b7280' } as React.CSSProperties}
      />

      {/* Label */}
      <span
        className="text-sm font-semibold tracking-wide truncate transition-colors duration-300"
        style={{ color: lit ? item.color : '#9ca3af' }}
      >
        {item.name}
      </span>
    </Link>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isAdminUser, setIsAdminUser] = React.useState(false);

  React.useEffect(() => {
    fetch('/api/admin/verify')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.isAdmin) setIsAdminUser(true);
      })
      .catch(() => {});
  }, []);

  const allItems = isAdminUser
    ? [...navigationItems, adminItem]
    : navigationItems;

  return (
    <aside
      className={cn(
        'relative z-30 hidden md:flex md:flex-col border-r text-card-foreground',
        'transition-[width] duration-300 ease-in-out overflow-hidden',
        collapsed ? 'w-[64px]' : 'w-60',
        'my-4 md:sticky md:top-4 md:h-[calc(100vh-2rem)] md:max-h-[calc(100vh-2rem)]'
      )}
      style={{
        background: 'rgba(6, 6, 10, 0.94)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderColor: 'rgba(255,255,255,0.07)',
        clipPath: collapsed
          ? 'none'
          : 'polygon(0% 0%, 100% 1.5%, 98.5% 100%, 0% 98.5%)',
        animation: 'shard-sidebar-float 10s ease-in-out infinite',
      }}
      aria-label="Barra lateral principal"
    >
      {/* Scan line */}
      <div
        className="absolute left-0 w-full h-px pointer-events-none z-20"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
          animation: 'sidebar-scan 4s linear infinite',
        }}
        aria-hidden="true"
      />

      {/* HUD corner marks */}
      <div className="absolute top-2 left-2 w-3 h-3 border-l border-t border-white/10 pointer-events-none" />
      <div className="absolute top-2 right-2 w-3 h-3 border-r border-t border-white/10 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-l border-b border-white/10 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-white/10 pointer-events-none" />

      {/* Header */}
      <div className="flex h-16 items-center px-2 border-b border-white/5 shrink-0">
        {collapsed ? (
          <div className="flex flex-1 items-center justify-center">
            <Link href="/">
              <img
                src="/logo.png"
                alt="GG"
                className="h-8 w-8 object-cover object-left rounded"
              />
            </Link>
          </div>
        ) : (
          <Link href="/" className="flex flex-1 items-center pl-2">
            <img
              src="/logo.png"
              alt="GG Empréstimos"
              className="h-36 w-auto max-w-[200px] object-contain object-left"
            />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-white/30 hover:text-white hover:bg-white/5"
          aria-label={
            collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'
          }
          onClick={onToggle}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Section label */}
      {!collapsed && (
        <div className="px-4 pt-3 pb-1 shrink-0">
          <span className="text-[8px] font-mono tracking-[0.45em] text-white/15 uppercase">
            Módulos
          </span>
        </div>
      )}

      {/* Nav */}
      <ScrollArea className="flex-1 min-h-0 px-2 py-1">
        <nav className="flex flex-col gap-0.5" aria-label="Navegação principal">
          {allItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon as React.ComponentType<{
              className?: string;
            }>;

            if (collapsed) {
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      aria-label={item.name}
                      className="flex items-center justify-center rounded-md p-2.5 transition-all duration-200"
                      style={{
                        background: isActive
                          ? `${item.color}18`
                          : 'transparent',
                        boxShadow: isActive
                          ? `inset 0 0 12px ${item.color}15`
                          : 'none',
                      }}
                    >
                      <Icon
                        className="h-4 w-4 transition-colors duration-200"
                        style={
                          {
                            color: isActive ? item.color : '#4b5563',
                          } as React.CSSProperties
                        }
                      />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <KineticItem
                key={item.name}
                item={item as NavItem}
                isActive={isActive}
              />
            );
          })}
        </nav>
      </ScrollArea>

      {/* Bottom rule */}
      {!collapsed && (
        <div className="mx-4 border-t border-white/5 mt-1 mb-3 shrink-0" />
      )}

      <style>{`
        @keyframes shard-sidebar-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-2px) rotate(0.1deg); }
        }
        @keyframes sidebar-scan {
          0%   { top: -1px; opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </aside>
  );
}
