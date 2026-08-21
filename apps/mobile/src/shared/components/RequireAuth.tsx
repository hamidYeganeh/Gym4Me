"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  authHref,
  needsProfileOnboarding,
  postAuthPath,
} from "@/shared/lib/auth-redirect";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useRouter } from "@/shared/lib/app-router";

type RequireAuthProps = {
  children: ReactNode;
  /** When true, redirect authenticated users away (auth pages). */
  guestOnly?: boolean;
};

/** Stable placeholder — identical on server and first client paint. */
function AuthGateShell() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="min-h-dvh w-full bg-background"
    />
  );
}

function sessionForRedirect(
  session: ReturnType<typeof useAuth>["session"],
  activeRole: ReturnType<typeof useAuth>["activeRole"],
) {
  return {
    activeRole: session?.activeRole ?? activeRole,
    isNewUser: session?.isNewUser,
    user: session?.user,
  };
}

export function RequireAuth({ children, guestOnly = false }: RequireAuthProps) {
  const { isAuthenticated, activeRole, isReady, session } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isReady) return;

    const authSession = sessionForRedirect(session, activeRole);

    if (guestOnly) {
      if (isAuthenticated) {
        // Match OTP/login success routing so guestOnly does not race past /onboarding.
        const next =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("next")
            : null;
        router.replace(postAuthPath(authSession, next));
      }
      return;
    }

    if (!isAuthenticated) {
      router.replace(authHref(pathname || "/"));
      return;
    }

    // Keep incomplete profiles inside the wizard (deep links / role home).
    if (
      pathname &&
      !pathname.startsWith("/onboarding") &&
      needsProfileOnboarding(authSession)
    ) {
      router.replace(postAuthPath(authSession, pathname));
    }
  }, [
    activeRole,
    guestOnly,
    isAuthenticated,
    isReady,
    pathname,
    router,
    session,
  ]);

  if (!isReady) {
    return <AuthGateShell />;
  }

  if (guestOnly) {
    if (isAuthenticated) return <AuthGateShell />;
    return children;
  }

  if (!isAuthenticated) return <AuthGateShell />;

  if (
    pathname &&
    !pathname.startsWith("/onboarding") &&
    needsProfileOnboarding(sessionForRedirect(session, activeRole))
  ) {
    return <AuthGateShell />;
  }

  return children;
}
