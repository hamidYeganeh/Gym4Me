"use client";

import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { ApiError, type CoachStudent } from "@repo/api";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "@/shared/lib/app-router";
import { accountCoaching, mediaFileUrl } from "@/shared/lib/api";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { useAuth } from "@/shared/providers/AuthProvider";
import { CoachClientsScreen } from "../screens/CoachClientsScreen";
import {
  COACH_CLIENTS,
  type CoachClient,
  type CoachClientEngagement,
} from "./coach-clients-data";

function mapEngagement(student: CoachStudent): CoachClientEngagement {
  if (student.status === "paused") return "paused";
  if (student.engagement.level === "at_risk") return "at-risk";
  if (student.engagement.level === "quiet") return "paused";
  return "active";
}

function mapStudent(student: CoachStudent): CoachClient {
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
    progressPercent: student.engagement.progressPercent ?? 0,
    engagement: mapEngagement(student),
  };
}

export function CoachClientsGate() {
  const t = useTranslations("CoachClients");
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFilter =
    searchParams.get("engagement") === "at-risk" ? "at-risk" : "all";
  const { activeRole, isAuthenticated, isReady } = useAuth();
  const [clients, setClients] = useState<CoachClient[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [followingUpId, setFollowingUpId] = useState<string | null>(null);
  const [followUpError, setFollowUpError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    const page = await accountCoaching.listStudents({
      page: 1,
      page_size: 100,
      engagementLevel: initialFilter === "at-risk" ? "at_risk" : undefined,
    });
    setClients(page.result.map(mapStudent));
  }, [initialFilter]);

  const followUp = useCallback(
    async (client: CoachClient) => {
      setFollowUpError(null);
      setFollowingUpId(client.id);
      try {
        if (!client.athleteUserId) {
          router.push("/coach/messages");
          return;
        }
        const thread = await accountCoaching.openCoachThread(
          client.athleteUserId,
        );
        router.push(`/coach/messages/${thread.id}`);
      } catch (cause: unknown) {
        setFollowUpError(
          cause instanceof ApiError ? cause.message : t("followUpError"),
        );
      } finally {
        setFollowingUpId(null);
      }
    },
    [router, t],
  );

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated || activeRole !== "coach") {
      setClients(DEMO_MODE ? COACH_CLIENTS : []);
      if (!DEMO_MODE) setError(t("unauthorized"));
      return;
    }

    let cancelled = false;
    reload().catch((cause: unknown) => {
      if (cancelled) return;
      setClients(DEMO_MODE ? COACH_CLIENTS : []);
      if (!DEMO_MODE) {
        setError(cause instanceof ApiError ? cause.message : t("loadError"));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [activeRole, isAuthenticated, isReady, reload, t]);

  if (!clients) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 text-center"
        role="alert"
      >
        <Typography type="body">{error}</Typography>
        {isAuthenticated && activeRole === "coach" ? (
          <Button size="lg" onPress={() => void reload()} variant="secondary">
            {t("retry")}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <CoachClientsScreen
      clients={clients}
      followUpError={followUpError}
      followingUpId={followingUpId}
      initialFilter={initialFilter}
      onFollowUp={followUp}
    />
  );
}
