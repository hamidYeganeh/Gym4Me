"use client";

import { Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import { accountProgress } from "@/shared/lib/api";
import { useFeatureFlag } from "@/shared/providers/AppConfigProvider";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteWorkoutDetailScreen } from "../screens/AthleteWorkoutDetailScreen";
import { mapWorkoutLog, mapWorkoutPlan } from "./map-workout-plans";
import {
  DEMO_WORKOUT_DETAIL,
  type AthleteWorkoutPlanDetail,
} from "./workout-programs-data";

export function AthleteWorkoutDetailGate({ planId }: { planId: string }) {
  const { isAuthenticated, isReady } = useAuth();
  const loggingEnabled = useFeatureFlag("athlete.workout_logging");
  const [detail, setDetail] = useState<AthleteWorkoutPlanDetail | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setDetail(
        planId === DEMO_WORKOUT_DETAIL.id
          ? DEMO_WORKOUT_DETAIL
          : {
              ...DEMO_WORKOUT_DETAIL,
              id: planId,
            },
      );
      return;
    }

    let cancelled = false;
    Promise.all([
      accountProgress.getWorkoutPlan(planId),
      accountProgress.listWorkoutLogs({ planId, page_size: 50 }),
    ])
      .then(([plan, logs]) => {
        if (cancelled) return;
        setDetail({
          ...mapWorkoutPlan(plan),
          logs: logs.result.map(mapWorkoutLog),
        });
      })
      .catch(() => {
        if (!cancelled) {
          setDetail({
            ...DEMO_WORKOUT_DETAIL,
            id: planId,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady, planId]);

  if (!detail) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AthleteWorkoutDetailScreen
      detail={detail}
      onLogSession={
        isAuthenticated && loggingEnabled
          ? async (status) => {
              setPending(true);
              try {
                const nextSessionIndex =
                  detail.logs.reduce(
                    (max, log) => Math.max(max, log.sessionIndex),
                    0,
                  ) + 1;
                const created = await accountProgress.createWorkoutLog({
                  planId,
                  sessionIndex: nextSessionIndex,
                  sets: [],
                  status,
                  loggedAt: new Date().toISOString(),
                });
                setDetail((current) =>
                  current
                    ? {
                        ...current,
                        logs: [mapWorkoutLog(created), ...current.logs],
                      }
                    : current,
                );
              } finally {
                setPending(false);
              }
            }
          : undefined
      }
      pending={pending}
    />
  );
}
