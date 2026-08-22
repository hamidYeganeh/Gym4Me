"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { decideAuthGate } from "@/shared/lib/auth-gate";
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
  const authSession = sessionForRedirect(session, activeRole);
  const next =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("next")
      : null;
  const decision = decideAuthGate({
    guestOnly,
    isAuthenticated,
    isReady,
    next,
    pathname,
    session: authSession,
  });

  useEffect(() => {
    if (decision.redirect) router.replace(decision.redirect);
  }, [decision.redirect, router]);

  return decision.render === "children" ? children : <AuthGateShell />;
}
