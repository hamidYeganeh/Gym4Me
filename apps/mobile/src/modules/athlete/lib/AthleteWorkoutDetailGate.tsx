"use client";

import { Spinner } from "@heroui/react/spinner";
import type { WorkoutLogSetInput } from "@repo/api";
import { useCallback, useEffect, useState } from "react";
import { accountProgress } from "@/shared/lib/api";
import { createClientMutationId } from "@/shared/lib/offline-queue";
import { useFeatureFlag } from "@/shared/providers/AppConfigProvider";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteWorkoutDetailScreen } from "../screens/AthleteWorkoutDetailScreen";
import { mapWorkoutPlanDetail } from "./map-workout-plans";
import {
  DEMO_WORKOUT_DETAIL,
  type AthleteWorkoutLogStatus,
  type AthleteWorkoutPlanDetail,
} from "./workout-programs-data";

function isActiveSession(status: AthleteWorkoutLogStatus) {
  return status === "draft" || status === "in_progress";
}

export function AthleteWorkoutDetailGate({ planId }: { planId: string }) {
  const { isAuthenticated, isReady } = useAuth();
  const loggingEnabled = useFeatureFlag("athlete.workout_logging");
  const [detail, setDetail] = useState<AthleteWorkoutPlanDetail | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setDetail(
        planId === DEMO_WORKOUT_DETAIL.id
          ? DEMO_WORKOUT_DETAIL
          : { ...DEMO_WORKOUT_DETAIL, id: planId },
      );
      return;
    }

    const [plan, logs] = await Promise.all([
      accountProgress.getWorkoutPlan(planId),
      accountProgress.listWorkoutLogs({ planId, page_size: 50 }),
    ]);

    const exerciseIds = [
      ...new Set(
        (plan.weeks ?? []).flatMap((week) =>
          (week.days ?? []).flatMap((day) =>
            (day.exercises ?? []).map((item) => item.exerciseId),
          ),
        ),
      ),
    ];

    const nameById = new Map<string, string>();
    if (exerciseIds.length > 0) {
      const exercisePage = await accountProgress
        .listExercises({ page_size: 100 })
        .catch(() => null);
      for (const exercise of exercisePage?.result ?? []) {
        nameById.set(exercise.id, exercise.name);
      }
    }

    setDetail(mapWorkoutPlanDetail(plan, logs.result, nameById));
  }, [isAuthenticated, planId]);

  useEffect(() => {
    if (!isReady) return;
    let cancelled = false;
    void load()
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
  }, [isReady, load, planId]);

  if (!detail) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const canLog = isAuthenticated && loggingEnabled;
  const activeSession = canLog
    ? (detail.logs.find((log) => isActiveSession(log.status)) ?? null)
    : null;

  const run = async (action: () => Promise<void>) => {
    setPending(true);
    setError(null);
    try {
      await action();
      await load();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "عملیات ناموفق بود.",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <AthleteWorkoutDetailScreen
      activeSession={activeSession}
      detail={detail}
      error={error}
      onAddSet={
        canLog && activeSession
          ? async (input) => {
              await run(async () => {
                const nextSets: WorkoutLogSetInput[] = [
                  ...activeSession.sets.map((set) => ({
                    exerciseId: set.exerciseId,
                    reps: set.reps,
                    weightKg: set.weightKg ?? undefined,
                  })),
                  {
                    exerciseId: input.exerciseId,
                    reps: input.reps,
                    weightKg: input.weightKg,
                  },
                ];
                await accountProgress.updateWorkoutLog(activeSession.id, {
                  sets: nextSets,
                  status: "in_progress",
                });
              });
            }
          : undefined
      }
      onCompleteSession={
        canLog && activeSession
          ? async () => {
              await run(async () => {
                await accountProgress.completeWorkoutLog(activeSession.id);
              });
            }
          : undefined
      }
      onLogSession={
        canLog
          ? async (status) => {
              await run(async () => {
                const nextSessionIndex =
                  detail.logs.reduce(
                    (max, log) => Math.max(max, log.sessionIndex),
                    0,
                  ) + 1;
                await accountProgress.createWorkoutLog({
                  planId,
                  sessionIndex: nextSessionIndex,
                  sets: [],
                  status,
                  loggedAt: new Date().toISOString(),
                  clientMutationId: createClientMutationId("workout"),
                });
              });
            }
          : undefined
      }
      onStartSession={
        canLog && !activeSession
          ? async () => {
              await run(async () => {
                const nextSessionIndex =
                  detail.logs.reduce(
                    (max, log) => Math.max(max, log.sessionIndex),
                    0,
                  ) + 1;
                await accountProgress.createWorkoutLog({
                  planId,
                  sessionIndex: nextSessionIndex,
                  sets: [],
                  status: "draft",
                  timing: { startedAt: new Date().toISOString() },
                  loggedAt: new Date().toISOString(),
                  clientMutationId: createClientMutationId("workout"),
                });
              });
            }
          : undefined
      }
      pending={pending}
    />
  );
}
