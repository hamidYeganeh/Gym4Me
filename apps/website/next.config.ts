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
    "http://localhost:8088/api/v1";
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
      hostname: "localhost",
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
  images: {
    remotePatterns: [
      apiRemotePattern(),
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
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
