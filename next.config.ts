import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import { withEve } from "eve/next";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  turbopack: {},
  allowedDevOrigins: [
    '*.replit.dev',
    '*.repl.co',
    '*.picard.replit.dev',
    '*.janeway.replit.dev',
    '*.kirk.replit.dev',
    '127.0.0.1',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'html.tailus.io',
      },
    ],
  },
};

export default withEve(withPWA(nextConfig));
