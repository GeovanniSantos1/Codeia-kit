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
  Settings,
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
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Empréstimos', href: '/loans', icon: HandCoins },
  { name: 'Lançamentos', href: '/transactions', icon: ArrowLeftRight },
  { name: 'Cobranças', href: '/cobrancas', icon: Megaphone },
  { name: 'Mensagens', href: '/messages', icon: MessageSquare },
  { name: 'Vence Hoje', href: '/alerts/today', icon: Bell },
  { name: 'Inadimplentes', href: '/alerts/overdue', icon: AlertTriangle },
  { name: 'Assinatura', href: '/billing', icon: CreditCard },
];

const adminItem = { name: 'Painel Admin', href: '/admin', icon: Shield };

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isAdminUser, setIsAdminUser] = React.useState(false);

  React.useEffect(() => {
    fetch('/api/admin/verify')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.isAdmin) setIsAdminUser(true);
      })
      .catch(() => {});
  }, []);

  const allItems = isAdminUser
    ? [...navigationItems, adminItem]
    : navigationItems;

  return (
    <aside
      className={cn(
        'relative z-30 hidden md:flex md:flex-col border-r border-border/40 bg-card/30 text-card-foreground backdrop-blur-xl supports-[backdrop-filter]:bg-card/20 glass-panel transition-[width] duration-200 ease-in-out',
        collapsed ? 'w-[64px]' : 'w-64',
        'my-4 md:sticky md:top-4 md:h-[calc(100vh-2rem)] md:max-h-[calc(100vh-2rem)] md:overflow-hidden'
      )}
      aria-label="Barra lateral principal"
    >
      <div className="flex h-14 items-center px-2">
        {collapsed ? (
          <div className="flex flex-1 items-center justify-center">
            <Link href="/">
              <img
                src="/logo.png"
                alt="GG Empréstimos"
                className="h-20 w-20 object-cover object-left rounded"
              />
            </Link>
          </div>
        ) : (
          <>
            <Link href="/" className="flex flex-1 items-center pl-1">
              <img
                src="/logo.png"
                alt="GG Empréstimos"
                className="h-20 w-auto max-w-[180px] object-contain object-left"
              />
            </Link>
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
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

      <ScrollArea className="flex-1 min-h-0">
        <nav
          className="flex flex-col gap-1 p-2"
          aria-label="Navegação principal"
        >
          {allItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');
            const link = (
              <Link
                key={item.name}
                href={item.href}
                aria-label={collapsed ? item.name : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  collapsed && 'justify-center',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );

            if (!collapsed) return link;

            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right" align="center">
                  {item.name}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
