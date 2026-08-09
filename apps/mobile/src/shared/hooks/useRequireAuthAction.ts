"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { authHref } from "@/shared/lib/auth-redirect";
import { useAuth } from "@/shared/providers/AuthProvider";

/**
 * Run an action only when authenticated; otherwise send the guest to `/auth`
 * with a `next` return URL.
 */
export function useRequireAuthAction() {
  const { isAuthenticated, isReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const runWithAuth = useCallback(
    (action: () => void, returnPath?: string | null) => {
      if (!isReady) return false;
      if (!isAuthenticated) {
        router.push(authHref(returnPath ?? pathname));
        return false;
      }
      action();
      return true;
    },
    [isAuthenticated, isReady, pathname, router],
  );

  return { runWithAuth, isAuthenticated, isReady };
}
