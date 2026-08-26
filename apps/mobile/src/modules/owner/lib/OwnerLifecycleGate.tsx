"use client";

import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { accountClubs, accountLifecycle } from "@/shared/lib/api";
import { formatJalaliFullDate } from "@/shared/lib/booking-view";
import { useAuth } from "@/shared/providers/AuthProvider";
import { OwnerLifecycleScreen } from "../screens/OwnerLifecycleScreen";
import type { OwnerLifecycleView } from "./owner-lifecycle-data";

export function OwnerLifecycleGate() {
  const t = useTranslations("OwnerLifecycle");
  const { activeRole, isAuthenticated, isReady } = useAuth();
  const [view, setView] = useState<OwnerLifecycleView | null>(null);
  const [clubId, setClubId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    const clubs = await accountClubs.list({ page_size: 1 });
    const club = clubs.result[0];
    if (!club) {
      setClubId(null);
      setView({
        clubName: "—",
        atRisk: [],
        journeys: [],
        segments: [],
      });
      return;
    }
    setClubId(club.id);
    const [atRisk, journeys, segments] = await Promise.all([
      accountLifecycle.listAtRisk(club.id),
      accountLifecycle.listJourneys(club.id),
      accountLifecycle.listSegments(club.id),
    ]);
    setView({
      clubName: club.identity.name,
      atRisk: [...atRisk.expiringSoon, ...atRisk.lowCredits].map((row) => ({
        id: row.id,
        userLabel: row.userId ? row.userId.slice(-6) : "مهمان",
        statusLabel: t(`membershipStatus.${row.status}`),
        remainingLabel:
          row.remainingSessions != null
            ? t("remainingSessions", { count: row.remainingSessions })
            : row.remainingEntries != null
              ? t("remainingEntries", { count: row.remainingEntries })
              : t("notAvailable"),
        expiresLabel: row.expiresAt
          ? formatJalaliFullDate(row.expiresAt)
          : t("notAvailable"),
      })),
      journeys: journeys.result.map((journey) => ({
        id: journey.id,
        userLabel: journey.userId.slice(-6),
        segmentLabel: t(`segment.${journey.segmentKind}`),
        status: journey.status,
        stepLabel: t("step", { count: journey.step + 1 }),
        nextActionLabel: journey.nextActionAt
          ? formatJalaliFullDate(journey.nextActionAt)
          : t("notAvailable"),
      })),
      segments: segments.result.map((segment) => ({
        id: segment.id,
        name: segment.name,
        kind: t(`segment.${segment.kind}`),
        status: segment.status,
      })),
    });
  }, [t]);

  useEffect(() => {
    if (!isReady) return;
    if (
      !isAuthenticated ||
      (activeRole !== "club_owner" && activeRole !== "club_staff")
    ) {
      setView({
        clubName: "—",
        atRisk: [],
        journeys: [],
        segments: [],
      });
      setLoadError(t("unauthorized"));
      return;
    }
    load().catch(() => {
      setView({
        clubName: "—",
        atRisk: [],
        journeys: [],
        segments: [],
      });
      setLoadError(t("loadError"));
    });
  }, [activeRole, isAuthenticated, isReady, load, t]);

  const runAction = async (action: "enroll" | "run") => {
    if (!clubId) return;
    setPending(true);
    setActionError(null);
    try {
      if (action === "enroll") await accountLifecycle.enrollExpiring(clubId);
      else await accountLifecycle.runJourneys(clubId);
      await load();
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : t("actionError"),
      );
    } finally {
      setPending(false);
    }
  };

  if (!view) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      {actionError ? (
        <div className="px-4 pt-2 text-center" role="alert">
          <Typography className="text-danger" type="body-sm">
            {actionError}
          </Typography>
        </div>
      ) : null}
      {loadError ? (
        <div className="px-4 pt-2 text-center" role="alert">
          <Typography className="text-danger" type="body-sm">
            {loadError}
          </Typography>
          {isAuthenticated ? (
            <Button
              className="mt-2"
              onPress={() =>
                void load().catch(() => setLoadError(t("loadError")))
              }
              size="sm"
              variant="secondary"
            >
              {t("retry")}
            </Button>
          ) : null}
        </div>
      ) : null}
      <OwnerLifecycleScreen
        onEnroll={
          isAuthenticated && clubId ? () => void runAction("enroll") : undefined
        }
        onRun={
          isAuthenticated && clubId ? () => void runAction("run") : undefined
        }
        pending={pending}
        view={view}
      />
    </>
  );
}
