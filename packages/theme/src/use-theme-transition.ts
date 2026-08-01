"use client";

import { useTheme as useNextTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";

export type ResolvedColorTheme = "light" | "dark";

/** @deprecated Origin options are ignored; theme changes apply instantly. */
export type ThemeTransitionOrigin = {
  x?: number;
  y?: number;
  fromCenter?: boolean;
  originElement?: Element | null;
  duration?: number;
};

function applyDocumentTheme(next: ResolvedColorTheme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(next);
  root.setAttribute("data-theme", next);
}

function readDocumentTheme(): ResolvedColorTheme {
  if (
    document.documentElement.classList.contains("dark") ||
    document.documentElement.getAttribute("data-theme") === "dark"
  ) {
    return "dark";
  }
  return "light";
}

/**
 * next-themes `useTheme` helpers for light/dark switching.
 * Theme changes apply instantly (no page reveal animation).
 */
export function useThemeTransition() {
  const themeApi = useNextTheme();
  const { setTheme, resolvedTheme, theme, systemTheme } = themeApi;
  const [mounted, setMounted] = useState(false);
  const setThemeRef = useRef(setTheme);
  setThemeRef.current = setTheme;

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme: ResolvedColorTheme =
    mounted && resolvedTheme === "light" ? "light" : "dark";
  const isDark = activeTheme === "dark";

  const setThemeWithTransition = useCallback(
    async (
      next: ResolvedColorTheme,
      _origin?: ThemeTransitionOrigin,
    ): Promise<void> => {
      void _origin;
      applyDocumentTheme(next);
      setThemeRef.current(next);
    },
    [],
  );

  const toggleThemeWithTransition = useCallback(
    async (_origin?: ThemeTransitionOrigin): Promise<void> => {
      void _origin;
      const next: ResolvedColorTheme =
        readDocumentTheme() === "dark" ? "light" : "dark";
      applyDocumentTheme(next);
      setThemeRef.current(next);
    },
    [],
  );

  return {
    ...themeApi,
    theme,
    systemTheme,
    resolvedTheme,
    /** Resolved light/dark after mount (defaults to dark before mount). */
    activeTheme,
    isDark,
    mounted,
    setThemeWithTransition,
    toggleThemeWithTransition,
  };
}
