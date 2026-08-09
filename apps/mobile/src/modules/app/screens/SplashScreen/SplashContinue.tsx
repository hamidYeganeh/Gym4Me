"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasSeenWelcome } from "@/modules/app/lib/welcome-storage";
import { roleHomePath } from "@/shared/lib/role-routes";
import { useAuth } from "@/shared/providers/AuthProvider";

const CONTINUE_DELAY_MS = 2800;

type SplashContinueProps = {
  /** Destination for returning guests who already saw welcome (default `/home`). */
  guestHref?: string;
};

/** Soft-continues past splash based on session + first-visit welcome. */
export function SplashContinue({ guestHref = "/home" }: SplashContinueProps) {
  const router = useRouter();
  const { isAuthenticated, activeRole, isReady } = useAuth();

  useEffect(() => {
    if (!isReady) return;

    const timer = window.setTimeout(() => {
      if (isAuthenticated) {
        router.replace(roleHomePath(activeRole));
        return;
      }
      if (!hasSeenWelcome()) {
        router.replace("/welcome");
        return;
      }
      router.replace(guestHref);
    }, CONTINUE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [activeRole, guestHref, isAuthenticated, isReady, router]);

  return null;
}
