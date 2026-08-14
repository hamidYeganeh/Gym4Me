"use client";

import { Spinner } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/shared/providers/AuthProvider";
import { CoachPackagesScreen } from "../screens/CoachPackagesScreen";
import type { CoachPackageCreateInput } from "../screens/CoachPackagesScreen/CoachPackagesScreen.types";
import {
  COACH_SESSION_PACKAGES,
  COACH_SOLD_PACKAGES,
  type CoachSessionPackage,
  type CoachSoldPackage,
} from "./coach-packages-data";

export function CoachPackagesGate() {
  const { isReady } = useAuth();
  const [packages, setPackages] = useState<CoachSessionPackage[] | null>(null);
  const [soldPackages, setSoldPackages] = useState<CoachSoldPackage[] | null>(
    null,
  );
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    setPackages(COACH_SESSION_PACKAGES);
    setSoldPackages(COACH_SOLD_PACKAGES);
  }, [isReady]);

  const onCreatePackage = useCallback(async (input: CoachPackageCreateInput) => {
    setCreating(true);
    try {
      setPackages((current) => [
        {
          id: `pkg-new-${Date.now()}`,
          title: input.title,
          sessionCount: input.sessionCount,
          priceLabel: input.priceLabel,
          status: "active",
          soldCount: 0,
          updatedLabel: "ایجاد همین الان",
        },
        ...(current ?? []),
      ]);
    } finally {
      setCreating(false);
    }
  }, []);

  if (!packages || !soldPackages) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <CoachPackagesScreen
      creating={creating}
      onCreatePackage={onCreatePackage}
      packages={packages}
      soldPackages={soldPackages}
    />
  );
}
