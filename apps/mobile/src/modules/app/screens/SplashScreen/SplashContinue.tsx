"use client";

import { useEffect } from "react";
import { useRouter } from "@/shared/lib/app-router";

import {
  hydrateOnboardingProfileFlag,
} from "@/modules/app/lib/onboarding-storage";
import { hasSeenWelcome } from "@/modules/app/lib/welcome-storage";
import { postAuthPath } from "@/shared/lib/auth-redirect";
import { hydrateFlags } from "@/shared/lib/flag-storage";
import { useAuth } from "@/shared/providers/AuthProvider";

const CONTINUE_DELAY_MS = 2800;

type SplashContinueProps = {
  /** Destination for returning guests who already saw welcome (default `/discovery`). */
  guestHref?: string;
};

/** Soft-continues past splash based on session + first-visit welcome. */
export function SplashContinue({ guestHref = "/discovery" }: SplashContinueProps) {
  const router = useRouter();
  const { isAuthenticated, activeRole, session, isReady } = useAuth();

  useEffect(() => {
    if (!isReady) return;

    let cancelled = false;

    const timer = window.setTimeout(() => {
      void (async () => {
        // Restore native-persisted flags before routing on them.
        await hydrateFlags();
        const userId = session?.user?.id;
        if (userId) {
          await hydrateOnboardingProfileFlag(userId);
        }
        if (cancelled) return;

        if (isAuthenticated) {
          router.replace(
            postAuthPath({
              activeRole: session?.activeRole ?? activeRole,
              isNewUser: session?.isNewUser,
              user: session?.user,
            }),
          );
          return;
        }
        if (!hasSeenWelcome()) {
          router.replace("/welcome");
          return;
        }
        router.replace(guestHref);
      })();
    }, CONTINUE_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [activeRole, guestHref, isAuthenticated, isReady, router, session]);

  return null;
}
