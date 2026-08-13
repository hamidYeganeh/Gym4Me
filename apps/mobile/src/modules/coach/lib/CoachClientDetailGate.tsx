"use client";

import { Spinner, Typography } from "@heroui/react";
import type { CoachStudent } from "@repo/api";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { accountCoaching, isDiscoveryApiId } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { CoachClientDetailScreen } from "../screens/CoachClientDetailScreen";
import {
  getCoachClientDetail,
  type CoachClientDetail,
  type CoachClientEngagement,
} from "./coach-clients-data";

function mapEngagement(student: CoachStudent): CoachClientEngagement {
  if (student.status === "paused") return "paused";
  if (student.engagement.level === "at_risk") return "at-risk";
  if (student.engagement.level === "quiet") return "paused";
  return "active";
}

function mapStudentDetail(student: CoachStudent): CoachClientDetail {
  const progress = student.engagement.progressPercent ?? 0;
  const seriesSeed = [0.55, 0.62, 0.7, 0.74, 0.82, 1].map((factor) =>
    Math.round(progress * factor),
  );
  return {
    id: student.id,
    athleteUserId: student.athleteUserId,
    name: student.athleteUserId.slice(-6),
    avatar: PLACEHOLDER_IMAGE,
    goalLabel: student.coaching.goalKey ?? "—",
    levelLabel: student.coaching.levelKey ?? "—",
    lastSessionLabel: student.engagement.lastSessionAt
      ? new Date(student.engagement.lastSessionAt).toLocaleDateString("fa-IR")
      : "—",
    progressPercent: progress,
    engagement: mapEngagement(student),
    trendPoints: seriesSeed.map((value, index) => ({
      label: String(index + 1),
      value,
    })),
    monthlySessionsSeries: seriesSeed,
    adherenceSeries: seriesSeed,
    monthlySessionsValue: String(Math.max(0, Math.round(progress / 10))),
    adherenceValue: String(progress),
    upcomingSessions: [],
    sessionHistory: [],
    note: student.notes?.trim() || "—",
  };
}

export function CoachClientDetailGate({ clientId }: { clientId: string }) {
  const t = useTranslations("CoachClientDetail");
  const router = useRouter();
  const { isAuthenticated, isReady } = useAuth();
  const [client, setClient] = useState<CoachClientDetail | null | undefined>(
    undefined,
  );
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    if (!isReady) return;

    const demo = getCoachClientDetail(clientId);
    if (!isAuthenticated) {
      setClient(demo ?? null);
      return;
    }

    if (!isDiscoveryApiId(clientId) && demo) {
      setClient(demo);
      return;
    }

    let cancelled = false;
    accountCoaching
      .listStudents({ page_size: 100 })
      .then((page) => {
        if (cancelled) return;
        const match =
          page.result.find((student) => student.id === clientId) ??
          page.result.find((student) => student.athleteUserId === clientId);
        if (match) {
          setClient(mapStudentDetail(match));
          return;
        }
        setClient(demo ?? null);
      })
      .catch(() => {
        if (!cancelled) setClient(demo ?? null);
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, isAuthenticated, isReady]);

  const onSendMessage = useCallback(async () => {
    const athleteUserId = client?.athleteUserId;
    if (!athleteUserId || !isAuthenticated) {
      router.push("/coach/messages");
      return;
    }
    setMessaging(true);
    try {
      const thread = await accountCoaching.openCoachThread(athleteUserId);
      router.push(`/coach/messages/${thread.id}`);
    } catch {
      router.push("/coach/messages");
    } finally {
      setMessaging(false);
    }
  }, [client?.athleteUserId, isAuthenticated, router]);

  if (client === undefined) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-6 text-center">
        <Typography className="text-muted" type="body">
          {t("notFound")}
        </Typography>
      </div>
    );
  }

  return (
    <CoachClientDetailScreen
      client={client}
      messaging={messaging}
      onSendMessage={onSendMessage}
    />
  );
}
