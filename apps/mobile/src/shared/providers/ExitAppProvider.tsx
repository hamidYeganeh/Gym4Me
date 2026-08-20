"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ExitAppSheet } from "@/modules/app/components/ExitAppSheet";
import { useRouter } from "@/shared/lib/app-router";

/**
 * Intercepts the Android hardware back button at the root of WebView history
 * and shows a confirmation sheet before exiting the app.
 */
export function ExitAppProvider() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    let cancelled = false;
    let removeListener: (() => void) | undefined;

    async function setupBackButton() {
      const { Capacitor } = await import("@capacitor/core");
      if (!Capacitor.isNativePlatform() || cancelled) {
        return;
      }

      const { App } = await import("@capacitor/app");
      const handle = await App.addListener("backButton", ({ canGoBack }) => {
        if (isOpenRef.current) {
          setIsOpen(false);
          return;
        }

        if (canGoBack) {
          router.back();
          return;
        }

        setIsOpen(true);
      });

      if (cancelled) {
        void handle.remove();
        return;
      }

      removeListener = () => {
        void handle.remove();
      };
    }

    void setupBackButton();

    return () => {
      cancelled = true;
      removeListener?.();
    };
  }, [router]);

  const handleStay = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleLeave = useCallback(() => {
    setIsOpen(false);
    void (async () => {
      const { Capacitor } = await import("@capacitor/core");
      if (!Capacitor.isNativePlatform()) {
        return;
      }
      const { App } = await import("@capacitor/app");
      await App.exitApp();
    })();
  }, []);

  return (
    <ExitAppSheet
      isOpen={isOpen}
      onLeave={handleLeave}
      onOpenChange={setIsOpen}
      onStay={handleStay}
    />
  );
}
