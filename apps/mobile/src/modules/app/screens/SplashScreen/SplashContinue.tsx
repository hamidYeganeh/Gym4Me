"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/providers/AuthProvider";
import { roleHomePath } from "@/shared/lib/role-routes";

const CONTINUE_DELAY_MS = 2800;

type SplashContinueProps = {
  /** Dev-only override when unauthenticated (e.g. `/dev`). */
  guestHref?: string;
};

/** Soft-continues past splash based on session. */
export function SplashContinue({ guestHref = "/auth/sign-in" }: SplashContinueProps) {
  const router = useRouter();
  const { isAuthenticated, activeRole, isReady } = useAuth();

  useEffect(() => {
    if (!isReady) return;

    const timer = window.setTimeout(() => {
      if (isAuthenticated) {
        router.replace(roleHomePath(activeRole));
        return;
      }
      router.replace(guestHref);
    }, CONTINUE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [activeRole, guestHref, isAuthenticated, isReady, router]);

  return null;
}
