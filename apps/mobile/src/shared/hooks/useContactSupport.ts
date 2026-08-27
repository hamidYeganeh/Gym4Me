"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";
import { roleSegment } from "@/shared/lib/role-routes";
import { useAuth } from "@/shared/providers/AuthProvider";

export function useContactSupport() {
  const tHelp = useTranslations("Mobile.HelpCenter");
  const router = useRouter();
  const { activeRole, isAuthenticated } = useAuth();

  return useCallback(() => {
    if (isAuthenticated) {
      router.push(`/${roleSegment(activeRole)}/profile/help`);
      return;
    }

    window.location.href = `tel:${tHelp("supportPhone")}`;
  }, [activeRole, isAuthenticated, router, tHelp]);
}
