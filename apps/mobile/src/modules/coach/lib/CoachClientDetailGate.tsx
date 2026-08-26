"use client";

import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import type { CoachStudent, WorkoutLog } from "@repo/api";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useCallback, useEffect, useState } from "react";
import {
  accountCoaching,
  accountProgress,
  isDiscoveryApiId,
  isDiscoveryDemoId,
  mediaFileUrl,
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
    name: student.athlete.displayName ?? student.athleteUserId.slice(-6),
    avatar: mediaFileUrl(student.athlete.avatarMediaId) ?? PLACEHOLDER_IMAGE,
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
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [workoutLogsLoading, setWorkoutLogsLoading] = useState(false);
  const [workoutLogsError, setWorkoutLogsError] = useState(false);
  const [reviewingLogId, setReviewingLogId] = useState<string | null>(null);

  const loadWorkoutLogs = useCallback(async () => {
    if (!client?.athleteUserId || !isAuthenticated) return;
    setWorkoutLogsLoading(true);
    setWorkoutLogsError(false);
    try {
      const page = await accountProgress.listWorkoutLogs({
        athleteId: client.athleteUserId,
        status: "completed",
        page_size: 20,
      });
      setWorkoutLogs(page.result);
    } catch {
      setWorkoutLogsError(true);
    } finally {
      setWorkoutLogsLoading(false);
    }
  }, [client?.athleteUserId, isAuthenticated]);

  useEffect(() => {
    void loadWorkoutLogs();
  }, [loadWorkoutLogs]);

  const onReviewWorkoutLog = useCallback(async (logId: string, note: string) => {
    setReviewingLogId(logId);
    try {
      const updated = await accountProgress.reviewWorkoutLog(logId, {
        note,
        clientMutationId: crypto.randomUUID(),
      });
      setWorkoutLogs((current) =>
        current.map((log) => (log.id === updated.id ? updated : log)),
      );
    } finally {
      setReviewingLogId(null);
    }
  }, []);

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
      workoutLogs={workoutLogs}
      workoutLogsLoading={workoutLogsLoading}
      workoutLogsError={workoutLogsError}
      reviewingLogId={reviewingLogId}
      onRetryWorkoutLogs={loadWorkoutLogs}
      onReviewWorkoutLog={onReviewWorkoutLog}
    />
  );
}
