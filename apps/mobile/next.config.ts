import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Fail clearly instead of hanging on slow static generation (G4M-001).
  staticPageGenerationTimeout: 120,
  // Phone / LAN testing hits the machine by IP; without this, Next blocks
  // `/_next` chunks (HeroUI, etc.) and onboarding slides render blank.
  allowedDevOrigins: [
    "10.191.88.178",
    "127.0.0.1",
    "localhost",
  ],
  experimental: {
    optimizePackageImports: [
      "@heroui/react",
      "@repo/icons",
      "@repo/ui",
      "@repo/api",
    ],
  },
  // Static export for Capacitor (webDir: out). Keep unset in `next dev` so
  // dynamic routes (e.g. /discovery/clubs/:clubId) can resolve any param.
  ...(process.env.NODE_ENV === "production" ? { output: "export" as const } : {}),
  images: {
    unoptimized: true,
  },
  transpilePackages: [
    "@repo/api",
    "@repo/fonts",
    "@repo/i18n",
    "@repo/icons",
    "@repo/theme",
    "@repo/ui",
  ],
};

export default withNextIntl(nextConfig);
