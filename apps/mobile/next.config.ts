import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactCompiler: true,
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
