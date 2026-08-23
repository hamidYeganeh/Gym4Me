"use client";

import { Spinner } from "@heroui/react/spinner";
import type { CoachStudent } from "@repo/api";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { useEffect, useState } from "react";
import { accountCoaching } from "@/shared/lib/api";
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
    name: student.athleteUserId.slice(-6),
    avatar: PLACEHOLDER_IMAGE,
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
  const { isAuthenticated, isReady } = useAuth();
  const [clients, setClients] = useState<CoachClient[] | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setClients(DEMO_MODE ? COACH_CLIENTS : []);
      return;
    }

    let cancelled = false;
    accountCoaching
      .listStudents({ page_size: 100 })
      .then((page) => {
        if (cancelled) return;
        setClients(page.result.map(mapStudent));
      })
      .catch(() => {
        if (!cancelled) setClients(DEMO_MODE ? COACH_CLIENTS : []);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady]);

  if (!clients) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <CoachClientsScreen clients={clients} />;
}
