"use client";

import React from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { site } from '@/lib/brand-config'

const menuItems = [
  { name: 'Recursos', href: '#features',  color: '#00ffcc' },
  { name: 'Preços',   href: '#pricing',   color: '#8b5cf6' },
  { name: 'FAQ',      href: '#faq',       color: '#06b6d4' },
  { name: 'Sobre',    href: '/',          color: '#f59e0b' },
]

// ─── Kinetic Shard Nav (desktop) ──────────────────────────────────────────────
function KineticNav() {
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null)
  const [indicatorStyle, setIndicatorStyle] = React.useState<React.CSSProperties>({
    left: 0, width: 0, opacity: 0,
  })
  const [navHovered, setNavHovered] = React.useState(false)
  const itemsRef = React.useRef<(HTMLAnchorElement | null)[]>([])

  const handleMouseEnter = (index: number) => {
    const el = itemsRef.current[index]
    if (el) {
      setHoveredIdx(index)
      setIndicatorStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
        opacity: 1,
        backgroundColor: menuItems[index].color,
      })
    }
  }

  const handleMouseLeave = () => {
    setHoveredIdx(null)
    setIndicatorStyle((s) => ({ ...s, opacity: 0 }))
    setNavHovered(false)
  }

  return (
    <>
      <style>{`
        @keyframes shard-nav-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%       { transform: translateY(-4px) rotate(0.4deg); }
        }
        @keyframes shard-nav-scan {
          0%   { transform: translateY(0);    opacity: 0; }
          8%   { opacity: 0.25; }
          92%  { opacity: 0.25; }
          100% { transform: translateY(52px); opacity: 0; }
        }
        .shard-nav-pill {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0;
          height: 52px;
          padding: 0 24px;
          background: rgba(8, 8, 12, 0.82);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.12);
          clip-path: polygon(4% 0%, 100% 12%, 96% 100%, 0% 88%);
          overflow: hidden;
          animation: shard-nav-float 8s ease-in-out infinite;
          transition: clip-path 0.5s cubic-bezier(0.175,0.885,0.32,1.275),
                      background 0.3s;
          box-shadow: 0 4px 32px rgba(0,0,0,0.25);
        }
        .shard-nav-pill:hover {
          clip-path: polygon(0% 12%, 96% 0%, 100% 88%, 4% 100%);
          background: rgba(12, 12, 18, 0.9);
        }
        .shard-scan {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 2px;
          background: linear-gradient(90deg, transparent, #fff, transparent);
          animation: shard-nav-scan 3s linear infinite;
          pointer-events: none;
        }
        .shard-liquid {
          position: absolute;
          height: 100%;
          top: 0;
          z-index: 1;
          filter: blur(14px);
          border-radius: 16px;
          transition: left 0.55s cubic-bezier(0.23,1,0.32,1),
                      width 0.55s cubic-bezier(0.23,1,0.32,1),
                      opacity 0.35s ease,
                      background-color 0.35s ease;
          pointer-events: none;
        }
        .shard-nav-item {
          position: relative;
          z-index: 2;
          padding: 0 22px;
          height: 100%;
          display: flex;
          align-items: center;
          cursor: pointer;
          white-space: nowrap;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          transition: color 0.3s;
        }
      `}</style>

      <nav
        className="shard-nav-pill"
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => setNavHovered(true)}
        aria-label="Navegação principal"
      >
        <div className="shard-scan" aria-hidden="true" />

        {menuItems.map((item, idx) => (
          <Link
            key={item.name}
            href={item.href}
            ref={(el) => { itemsRef.current[idx] = el }}
            className="shard-nav-item"
            onMouseEnter={() => handleMouseEnter(idx)}
            style={{ color: hoveredIdx === idx ? item.color : 'rgba(255,255,255,0.75)' }}
          >
            {item.name}
          </Link>
        ))}

        <div className="shard-liquid" style={indicatorStyle} aria-hidden="true" />
      </nav>
    </>
  )
}

// ─── Public Header ─────────────────────────────────────────────────────────────
export function PublicHeader() {
  const [menuState, setMenuState] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header>
      <nav
        data-state={menuState && 'active'}
        className="fixed z-20 w-full px-2 group"
      >
        <div
          className={cn(
            'mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12',
            isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5'
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            {/* Logo */}
            <div className="flex w-full justify-between lg:w-auto">
              <Link href="/" aria-label={site.shortName} className="flex items-center">
                <img src="/logo.png" alt="GG Empréstimos" className="h-36 w-auto max-w-[200px] object-contain" />
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? 'Fechar menu' : 'Abrir menu'}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            {/* Desktop: KineticShard nav */}
            <div className="absolute inset-0 m-auto hidden size-fit lg:flex items-center">
              <KineticNav />
            </div>

            {/* Right actions */}
            <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              {/* Mobile nav links */}
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150"
                        onClick={() => setMenuState(false)}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA buttons */}
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className={cn(isScrolled && 'lg:hidden')}
                >
                  <Link href="/sign-in">Entrar</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className={cn(isScrolled && 'lg:hidden')}
                >
                  <Link href="/sign-up">Criar conta</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className={cn(isScrolled ? 'lg:inline-flex' : 'hidden')}
                >
                  <Link href="/sign-up">Começar agora</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
