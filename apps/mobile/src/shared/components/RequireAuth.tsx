"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authHref } from "@/shared/lib/auth-redirect";
import { roleHomePath } from "@/shared/lib/role-routes";
import { useAuth } from "@/shared/providers/AuthProvider";

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

export function RequireAuth({ children, guestOnly = false }: RequireAuthProps) {
  const { isAuthenticated, activeRole, isReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isReady) return;

    if (guestOnly) {
      if (isAuthenticated) {
        router.replace(roleHomePath(activeRole));
      }
      return;
    }

    if (!isAuthenticated) {
      router.replace(authHref(pathname || "/"));
    }
  }, [activeRole, guestOnly, isAuthenticated, isReady, pathname, router]);

  if (!isReady) {
    return <AuthGateShell />;
  }

  if (guestOnly) {
    if (isAuthenticated) return <AuthGateShell />;
    return children;
  }

  if (!isAuthenticated) return <AuthGateShell />;
  return children;
}
