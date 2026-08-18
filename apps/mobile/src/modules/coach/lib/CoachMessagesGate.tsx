"use client";

import { Spinner } from "@heroui/react/spinner";
import type { CoachThread } from "@repo/api";
import { useEffect, useState } from "react";
import { accountCoaching } from "@/shared/lib/api";
import { formatJalaliDateTime } from "@/shared/lib/booking-view";
import { useAuth } from "@/shared/providers/AuthProvider";
import { CoachMessagesScreen } from "../screens/CoachMessagesScreen";
import {
  COACH_MESSAGE_THREADS,
  type CoachMessageThread,
} from "./coach-messages-data";

function mapThread(thread: CoachThread): CoachMessageThread {
  return {
    id: thread.id,
    athleteUserId: thread.athleteUserId,
    title: `شاگرد · ${thread.athleteUserId.slice(-6)}`,
    preview: thread.lastMessageAt
      ? formatJalaliDateTime(thread.lastMessageAt)
      : "—",
    updatedLabel: thread.lastMessageAt
      ? formatJalaliDateTime(thread.lastMessageAt)
      : new Date(thread.updatedAt).toLocaleDateString("fa-IR"),
  };
}

export function CoachMessagesGate() {
  const { isAuthenticated, isReady } = useAuth();
  const [threads, setThreads] = useState<CoachMessageThread[] | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setThreads(COACH_MESSAGE_THREADS);
      return;
    }

    let cancelled = false;
    accountCoaching
      .listCoachThreads({ page_size: 50 })
      .then((page) => {
        if (cancelled) return;
        setThreads(
          page.result.length > 0
            ? page.result.map(mapThread)
            : COACH_MESSAGE_THREADS,
        );
      })
      .catch(() => {
        if (!cancelled) setThreads(COACH_MESSAGE_THREADS);
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

  return <CoachMessagesScreen threads={threads} />;
}
