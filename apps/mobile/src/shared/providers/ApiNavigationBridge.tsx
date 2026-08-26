"use client";

import { useEffect } from "react";
import { useRouter } from "@/shared/lib/app-router";
import { API_NAVIGATION_EVENT } from "@/shared/lib/api-client";

/** Converts transport-layer recovery requests into App Router navigation. */
export function ApiNavigationBridge() {
  const router = useRouter();

  useEffect(() => {
    const navigate = (event: Event) => {
      const path = (event as CustomEvent<unknown>).detail;
      if (typeof path !== "string" || !path.startsWith("/")) return;
      router.replace(path);
    };
    window.addEventListener(API_NAVIGATION_EVENT, navigate);
    return () => window.removeEventListener(API_NAVIGATION_EVENT, navigate);
  }, [router]);

  return null;
}
