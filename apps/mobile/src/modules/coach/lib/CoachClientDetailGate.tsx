"use client";

import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import type { CoachStudent } from "@repo/api";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useCallback, useEffect, useState } from "react";
import {
  accountCoaching,
  isDiscoveryApiId,
  isDiscoveryDemoId,
} from "@/shared/lib/api";
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
    trendPoints: [],
    monthlySessionsSeries: [],
    adherenceSeries: [],
    monthlySessionsValue: "—",
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

    const demo = isDiscoveryDemoId(clientId)
      ? getCoachClientDetail(clientId)
      : null;
    if (!isAuthenticated) {
      setClient(demo ?? null);
      return;
    }

    if (!isDiscoveryApiId(clientId)) {
      setClient(demo ?? null);
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
        setClient(null);
      })
      .catch(() => {
        if (!cancelled) setClient(null);
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
