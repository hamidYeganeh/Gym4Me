"use client";

import { useEffect } from "react";

/**
 * Initializes Capacitor native plugins once the WebView is ready.
 * No-ops when running in a regular browser.
 */
export function CapacitorProvider() {
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

      await Promise.all([
        StatusBar.setStyle({ style: Style.Light }).catch(() => undefined),
        StatusBar.setBackgroundColor({ color: "#1f1f1f" }).catch(
          () => undefined,
        ),
        SplashScreen.hide().catch(() => undefined),
      ]);
    }

    void setupNativeShell();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
