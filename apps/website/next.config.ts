import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const appDir = path.dirname(fileURLToPath(import.meta.url));

function apiRemotePattern(): {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname: string;
} {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    (process.env.NODE_ENV === "production"
      ? "https://api.gym4me.ir/api/v1"
      : "http://192.168.3.106:8088/api/v1");
  try {
    const url = new URL(raw);
    return {
      protocol: url.protocol === "https:" ? "https" : "http",
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname: "/**",
    };
  } catch {
    return {
      protocol: "http",
      hostname: "192.168.3.106",
      port: "8088",
      pathname: "/**",
    };
  }
}

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "@heroui/react",
      "@repo/icons",
      "@repo/ui",
      "@repo/api",
    ],
  },
  output: "standalone",
  // Trace workspace packages from the monorepo root (required for Docker).
  outputFileTracingRoot: path.join(appDir, "../.."),
  reactCompiler: true,
  // Fail clearly instead of hanging on slow static generation (G4M-001).
  staticPageGenerationTimeout: 120,
  images: {
    remotePatterns: [apiRemotePattern()],
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
