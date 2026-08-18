"use client";

import type { ReactNode } from "react";
import { RoleAppNavigation } from "@/shared/components/RoleAppNavigation";
import { roleSegment } from "@/shared/lib/role-routes";
import { useAuth } from "@/shared/providers/AuthProvider";

export default function CommunityLayout({ children }: { children: ReactNode }) {
  const { activeRole } = useAuth();

  return (
    <RoleAppNavigation role={roleSegment(activeRole)}>
      {children}
    </RoleAppNavigation>
  );
}
