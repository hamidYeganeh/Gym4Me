"use client";

import type { ReactNode } from "react";
import { RoleAppNavigation } from "@/shared/components/RoleAppNavigation";
import { useAuth } from "@/shared/providers/AuthProvider";

/**
 * Articles are role-agnostic (`/articles/*`).
 * Athletes and guests keep the athlete bottom nav while reading.
 */
export default function ArticlesLayout({ children }: { children: ReactNode }) {
  const { isReady, isAuthenticated, activeRole } = useAuth();

  if (!isReady) {
    return <div className="min-h-dvh bg-background">{children}</div>;
  }

  if (!isAuthenticated || activeRole === "athlete") {
    return (
      <RoleAppNavigation allowGuest role="athlete">
        {children}
      </RoleAppNavigation>
    );
  }

  return children;
}
