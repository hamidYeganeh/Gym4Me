"use client";

import { Spinner } from "@heroui/react";
import type {
  AthleteDataGrant,
  CreateAthleteDataGrantInput,
} from "@repo/api";
import { useCallback, useEffect, useState } from "react";
import { accountCoaching, accountProgress } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteDataGrantsScreen } from "../screens/AthleteDataGrantsScreen";
import type { CoachRelationshipOption } from "./data-grants-data";

export type { CoachRelationshipOption } from "./data-grants-data";

export function AthleteDataGrantsGate() {
  const { isAuthenticated, isReady } = useAuth();
  const [grants, setGrants] = useState<AthleteDataGrant[] | null>(null);
  const [coaches, setCoaches] = useState<CoachRelationshipOption[]>([]);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setGrants([]);
      setCoaches([]);
      return;
    }

    const [grantPage, coachPage] = await Promise.all([
      accountProgress.listDataGrants({ page_size: 100 }),
      accountCoaching.listMyCoaches({ page_size: 50, status: "active" }),
    ]);

    setGrants(grantPage.result);
    setCoaches(
      coachPage.result.map((item) => ({
        relationshipId: item.id,
        coachUserId: item.coachUserId,
        label: `مربی ${item.coachUserId.slice(-6)}`,
      })),
    );
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isReady) return;
    void load().catch(() => {
      setGrants([]);
      setCoaches([]);
    });
  }, [isReady, load]);

  if (!grants) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AthleteDataGrantsScreen
      coaches={coaches}
      grants={grants}
      onCreate={async (input: CreateAthleteDataGrantInput) => {
        setPending(true);
        try {
          await accountProgress.createDataGrant(input);
          await load();
        } finally {
          setPending(false);
        }
      }}
      onRevoke={async (id) => {
        setPending(true);
        try {
          await accountProgress.revokeDataGrant(id);
          await load();
        } finally {
          setPending(false);
        }
      }}
      pending={pending}
    />
  );
}
