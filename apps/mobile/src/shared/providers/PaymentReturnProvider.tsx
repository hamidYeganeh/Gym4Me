"use client";

import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";
import { parseNativePaymentReturn } from "@/shared/lib/payment-return";
import { useRouter } from "@/shared/lib/app-router";

export function PaymentReturnProvider() {
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let disposed = false;
    const open = (url: string | undefined) => {
      if (disposed || !url) return;
      const target = parseNativePaymentReturn(url);
      if (target) router.replace(target);
    };
    void App.getLaunchUrl().then((launch) => open(launch?.url));
    const listener = App.addListener("appUrlOpen", ({ url }) => open(url));
    return () => {
      disposed = true;
      void listener.then((handle) => handle.remove());
    };
  }, [router]);

  return null;
}
