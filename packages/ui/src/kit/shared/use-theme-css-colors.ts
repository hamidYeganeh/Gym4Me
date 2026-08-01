"use client";

import { useEffect, useState } from "react";

function resolveCssColor(variable: string, fallback: string) {
  if (typeof window === "undefined") return fallback;

  const probe = document.createElement("span");
  probe.style.color = `var(${variable})`;
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  document.body.removeChild(probe);

  return resolved && resolved !== "rgba(0, 0, 0, 0)" ? resolved : fallback;
}

export type ThemeCssColors = {
  foreground: string;
  muted: string;
  accent: string;
  border: string;
  surface: string;
};

const FALLBACKS: ThemeCssColors = {
  foreground: "var(--foreground)",
  muted: "var(--muted)",
  accent: "var(--accent)",
  border: "var(--border)",
  surface: "var(--surface)",
};

/**
 * Resolves theme CSS variables to concrete colors (usually `rgb(...)`)
 * so motion can interpolate them, and re-reads on theme changes.
 */
export function useThemeCssColors(): ThemeCssColors {
  const [colors, setColors] = useState<ThemeCssColors>(FALLBACKS);

  useEffect(() => {
    const sync = () => {
      setColors({
        foreground: resolveCssColor("--foreground", FALLBACKS.foreground),
        muted: resolveCssColor("--muted", FALLBACKS.muted),
        accent: resolveCssColor("--accent", FALLBACKS.accent),
        border: resolveCssColor("--border", FALLBACKS.border),
        surface: resolveCssColor("--surface", FALLBACKS.surface),
      });
    };

    sync();

    const root = document.documentElement;
    const observer = new MutationObserver(sync);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", sync);

    return () => {
      observer.disconnect();
      media.removeEventListener("change", sync);
    };
  }, []);

  return colors;
}
