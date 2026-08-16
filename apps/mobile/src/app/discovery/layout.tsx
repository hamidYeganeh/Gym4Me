"use client";

import type { ReactNode } from "react";
import { RoleAppNavigation } from "@/shared/components/RoleAppNavigation";
import { useAuth } from "@/shared/providers/AuthProvider";

/**
 * Discovery is role-agnostic (`/discovery/*`).
 * Athletes and guests share the athlete bottom nav while browsing.
 */
export default function DiscoveryLayout({ children }: { children: ReactNode }) {
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
