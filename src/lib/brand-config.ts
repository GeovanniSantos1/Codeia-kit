import type { Metadata, Viewport } from 'next'

type LogoPaths = {
  light?: string
  dark?: string
}

type IconPaths = {
  favicon?: string
  apple?: string
  shortcut?: string
}

export type AnalyticsConfig = {
  gtmId?: string
  gaMeasurementId?: string
  facebookPixelId?: string
}

export const site = {
  name: 'GG Empréstimos — Gestão de Empréstimos',
  shortName: 'GG Empréstimos',
  description:
    'Gerencie empréstimos pessoais com cálculo automático de juros e multas, controle de parcelas, cobranças preventivas e reativas via WhatsApp, solicitações online de empréstimo e planos de assinatura.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000',
  author: 'GG Empréstimos',
  keywords: [
    'empréstimos pessoais',
    'gestão financeira',
    'controle de parcelas',
    'fluxo de caixa',
    'cobrança via WhatsApp',
    'solicitação de empréstimo',
    'juros e multas automáticos',
    'SaaS financeiro',
    'gestão de clientes',
  ],
  ogImage: '/og-image.png',
  logo: {
    light: '/logo-light.svg',
    dark: '/logo-dark.svg',
  } as LogoPaths,
  icons: {
    favicon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon-16x16.png',
  } as IconPaths,
  socials: {
    twitter: '@aicodersacademy',
  },
  support: {
    email: 'suporte@aicoders.academy',
  },
  analytics: {
    gtmId: process.env.NEXT_PUBLIC_GTM_ID,
    gaMeasurementId: process.env.NEXT_PUBLIC_GA_ID,
    facebookPixelId: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID,
  } as AnalyticsConfig,
} as const

export const siteMetadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.name,
  description: site.description,
  keywords: [...site.keywords],
  authors: [{ name: site.author }],
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: site.shortName,
  },
  openGraph: {
    title: site.name,
    description: site.description,
    url: site.url,
    siteName: site.name,
    images: site.ogImage ? [{ url: site.ogImage }] : undefined,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: site.name,
    description: site.description,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: ['/apple-touch-icon.png'],
  },
}

export const siteViewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#06b6d4' },
    { media: '(prefers-color-scheme: light)', color: '#06b6d4' },
  ],
  colorScheme: 'dark',
}
