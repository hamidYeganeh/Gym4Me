import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

function vendorChunk(id: string): string | undefined {
  if (!id.includes("node_modules")) return undefined;
  if (id.includes("tinymce") || id.includes("@tinymce")) return "tinymce";
  if (id.includes("@heroui")) return "heroui";
  if (id.includes("@tanstack")) return "tanstack";
  if (id.includes("react-router") || id.includes("@remix-run")) return "router";
  if (
    /(?:^|[/\\])(?:react|react-dom|scheduler)(?:[/\\]|$)/.test(id)
  ) {
    return "react";
  }
  return undefined;
}

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
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
