import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

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
  reactCompiler: true,
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
