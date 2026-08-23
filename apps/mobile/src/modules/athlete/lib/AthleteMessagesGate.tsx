"use client";

import { Spinner } from "@heroui/react/spinner";
import type { CoachThread } from "@repo/api";
import { useEffect, useState } from "react";
import { accountCoaching } from "@/shared/lib/api";
import { formatJalaliDateTime } from "@/shared/lib/booking-view";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteMessagesScreen } from "../screens/AthleteMessagesScreen";
import {
  ATHLETE_MESSAGE_THREADS,
  type AthleteMessageThread,
} from "./athlete-messages-data";

function mapThread(thread: CoachThread): AthleteMessageThread {
  return {
    id: thread.id,
    coachUserId: thread.coachUserId,
    title: `مربی · ${thread.coachUserId.slice(-6)}`,
    preview: thread.lastMessageAt
      ? formatJalaliDateTime(thread.lastMessageAt)
      : "—",
    updatedLabel: thread.lastMessageAt
      ? formatJalaliDateTime(thread.lastMessageAt)
      : new Date(thread.updatedAt).toLocaleDateString("fa-IR"),
  };
}

export function AthleteMessagesGate() {
  const { isAuthenticated, isReady } = useAuth();
  const [threads, setThreads] = useState<AthleteMessageThread[] | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setThreads(DEMO_MODE ? ATHLETE_MESSAGE_THREADS : []);
      return;
    }

    let cancelled = false;
    accountCoaching
      .listAthleteThreads({ page_size: 50 })
      .then((page) => {
        if (cancelled) return;
        setThreads(page.result.map(mapThread));
      })
      .catch(() => {
        if (!cancelled) setThreads(DEMO_MODE ? ATHLETE_MESSAGE_THREADS : []);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady]);

  if (!threads) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <AthleteMessagesScreen threads={threads} />;
}
