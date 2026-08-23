import type { NextConfig } from "next";
import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} from "next/constants";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default function mobileNextConfig(phase: string): NextConfig {
  const isDevelopment = phase === PHASE_DEVELOPMENT_SERVER;
  const isProductionBuild = phase === PHASE_PRODUCTION_BUILD;
  const demoMode =
    isDevelopment &&
    process.env.NEXT_PUBLIC_DEMO_MODE?.trim().toLowerCase() === "true";

  return withNextIntl({
    reactCompiler: true,
    // Override the public value from Next's phase. A shell/.env override can
    // therefore never activate fixture routes in a production export.
    env: {
      NEXT_PUBLIC_BUILD_ENV: isDevelopment ? "development" : "production",
      NEXT_PUBLIC_DEMO_MODE: demoMode ? "true" : "false",
    },
    // Fail clearly instead of hanging on slow static generation (G4M-001).
    staticPageGenerationTimeout: 120,
    // Phone / LAN testing hits the machine by IP; without this, Next blocks
    // `/_next` chunks (HeroUI, etc.) and onboarding slides render blank.
    allowedDevOrigins: ["10.191.88.178", "127.0.0.1", "localhost"],
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
    ...(isProductionBuild ? { output: "export" as const } : {}),
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
  });
}
