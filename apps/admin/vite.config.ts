import { cpSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const TINYMCE_SRC = path.resolve(rootDir, "../../node_modules/tinymce");
const TINYMCE_PUBLIC = path.join(rootDir, "public/tinymce");
const TINYMCE_ASSETS = [
  "tinymce.min.js",
  "themes/silver/theme.min.js",
  "models/dom/model.min.js",
  "icons/default/icons.min.js",
  "plugins/lists/plugin.min.js",
  "plugins/link/plugin.min.js",
  "plugins/image/plugin.min.js",
  "plugins/table/plugin.min.js",
  "plugins/directionality/plugin.min.js",
  "plugins/code/plugin.min.js",
  "plugins/fullscreen/plugin.min.js",
] as const;

function vendorChunk(id: string): string | undefined {
  if (!id.includes("node_modules")) return undefined;
  if (id.includes("react-router") || id.includes("@remix-run")) return "router";
  if (
    /(?:^|[/\\])node_modules[/\\](?:react|react-dom|scheduler)(?:[/\\]|$)/.test(
      id,
    )
  ) {
    return "react";
  }
  return undefined;
}

/** Keep mobile/marketing copy out of the admin bundle. */
function adminI18nOnly(): Plugin {
  return {
    name: "admin-i18n-only",
    enforce: "pre",
    transform(code, id) {
      const file = id.split("?")[0].replace(/\\/g, "/");
      if (!file.endsWith("/packages/i18n/messages/fa.json")) return;
      const json = JSON.parse(code) as {
        Metadata: unknown;
        Admin: unknown;
      };
      return {
        code: JSON.stringify({
          Metadata: json.Metadata,
          Admin: json.Admin,
        }),
        map: null,
      };
    },
  };
}

function syncTinymcePublic() {
  rmSync(TINYMCE_PUBLIC, { recursive: true, force: true });
  for (const rel of TINYMCE_ASSETS) {
    const dest = path.join(TINYMCE_PUBLIC, rel);
    mkdirSync(path.dirname(dest), { recursive: true });
    cpSync(path.join(TINYMCE_SRC, rel), dest);
  }
}

/** Serve self-hosted TinyMCE from /tinymce instead of bundling it. */
function tinymcePublicAssets(): Plugin {
  return {
    name: "tinymce-public-assets",
    buildStart() {
      syncTinymcePublic();
    },
  };
}

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [
    adminI18nOnly(),
    tinymcePublicAssets(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
      "@modules": path.resolve(rootDir, "src/modules"),
      "@shared": path.resolve(rootDir, "src/shared"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    cssCodeSplit: true,
    target: "es2022",
    rollupOptions: {
      output: {
        manualChunks: vendorChunk,
      },
    },
  },
  server: {
    port: 8089,
    strictPort: true,
  },
  preview: {
    port: 8082,
    strictPort: true,
  },
});
