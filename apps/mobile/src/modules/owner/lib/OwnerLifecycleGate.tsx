"use client";

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

const SEGMENT_LABEL: Record<string, string> = {
  expiring_soon: "نزدیک به انقضا",
  low_credits: "اعتبار کم",
  no_visit: "بدون حضور",
  incomplete_payment: "پرداخت ناقص",
  trial_unconverted: "آزمایشی تبدیل‌نشده",
};

export function OwnerLifecycleGate() {
  const t = useTranslations("OwnerLifecycle");
  const { isAuthenticated, isReady } = useAuth();
  const [view, setView] = useState<OwnerLifecycleView | null>(null);
  const [clubId, setClubId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
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
        statusLabel: row.status,
        remainingLabel:
          row.remainingSessions != null
            ? `${row.remainingSessions} جلسه`
            : row.remainingEntries != null
              ? `${row.remainingEntries} ورود`
              : "—",
        expiresLabel: row.expiresAt ? formatJalaliFullDate(row.expiresAt) : "—",
      })),
      journeys: journeys.result.map((journey) => ({
        id: journey.id,
        userLabel: journey.userId.slice(-6),
        segmentLabel: SEGMENT_LABEL[journey.segmentKind] ?? journey.segmentKind,
        status: journey.status,
        stepLabel: `گام ${journey.step + 1}`,
        nextActionLabel: journey.nextActionAt
          ? formatJalaliFullDate(journey.nextActionAt)
          : "—",
      })),
      segments: segments.result.map((segment) => ({
        id: segment.id,
        name: segment.name,
        kind: SEGMENT_LABEL[segment.kind] ?? segment.kind,
        status: segment.status,
      })),
    });
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setView({
        clubName: "—",
        atRisk: [],
        journeys: [],
        segments: [],
      });
      return;
    }
    load().catch(() => {
      setView({
        clubName: "—",
        atRisk: [],
        journeys: [],
        segments: [],
      });
    });
  }, [isAuthenticated, isReady, load]);

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
        <div className="px-4 pt-2 text-center">
          <Typography className="text-danger" type="body-sm">
            {actionError}
          </Typography>
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
