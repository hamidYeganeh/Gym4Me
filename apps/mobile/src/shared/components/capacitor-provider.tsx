"use client";

import { useTheme } from "@repo/theme";
import { useEffect } from "react";
import { setupCapacitorKeyboard } from "@/shared/lib/capacitor-keyboard";

/**
 * Initializes Capacitor native plugins once the WebView is ready.
 * Keeps the status bar in sync with the active light/dark theme.
 * Keyboard handling also runs in the browser via visualViewport.
 */
export function CapacitorProvider() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    let cancelled = false;
    let teardownKeyboard: (() => void) | undefined;

    async function setupKeyboard() {
      const cleanup = await setupCapacitorKeyboard();
      if (cancelled) {
        cleanup();
        return;
      }
      teardownKeyboard = cleanup;
    }

    void setupKeyboard();

    return () => {
      cancelled = true;
      teardownKeyboard?.();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function setupNativeShell() {
      const { Capacitor } = await import("@capacitor/core");
      if (!Capacitor.isNativePlatform() || cancelled) {
        return;
      }

      const [{ StatusBar, Style }, { SplashScreen }] = await Promise.all([
        import("@capacitor/status-bar"),
        import("@capacitor/splash-screen"),
      ]);

      const isDark = resolvedTheme !== "light";

      await Promise.all([
        // Draw under the status bar so CSS `env(safe-area-inset-*)` is meaningful
        StatusBar.setOverlaysWebView({ overlay: true }).catch(() => undefined),
        // Style.Light = light icons (dark chrome); Style.Dark = dark icons (light chrome)
        StatusBar.setStyle({
          style: isDark ? Style.Light : Style.Dark,
        }).catch(() => undefined),
        StatusBar.setBackgroundColor({
          color: isDark ? "#1f1f1f" : "#f7f7f7",
        }).catch(() => undefined),
        SplashScreen.hide().catch(() => undefined),
      ]);
    }

    void setupNativeShell();

    return () => {
      cancelled = true;
    };
  }, [resolvedTheme]);

  return null;
}
