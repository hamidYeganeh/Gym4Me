"use client";

import { Spinner } from "@heroui/react/spinner";
import type { WorkoutLogSetInput } from "@repo/api";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { accountProgress } from "@/shared/lib/api";
import {
  createClientMutationId,
  discardWorkoutOperations,
  enqueueWorkoutOperation,
  flush,
  isNetworkFailure,
  listPendingWorkoutOperations,
  retryWorkoutOperations,
  type OfflineWorkoutQueueItem,
} from "@/shared/lib/offline-queue";
import { canUseDemoFixtureId } from "@/shared/lib/runtime-mode";
import { useFeatureFlag } from "@/shared/providers/AppConfigProvider";
import { useAuth } from "@/shared/providers/AuthProvider";
import {
  loadWorkoutPlanCache,
  saveWorkoutPlanCache,
} from "@/shared/lib/workout-plan-cache";
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

function applyOfflineOperations(
  detail: AthleteWorkoutPlanDetail,
  operations: OfflineWorkoutQueueItem[],
): AthleteWorkoutPlanDetail {
  const logs = detail.logs.map((log) => ({ ...log, sets: [...log.sets] }));
  for (const item of operations) {
    const payload = item.payload;
    let log = logs.find(
      (candidate) =>
        candidate.id === payload.localLogId ||
        candidate.id === item.serverResourceId,
    );
    if (payload.operation === "create") {
      if (!log) {
        log = {
          id: payload.localLogId,
          sessionIndex: payload.input.sessionIndex,
          status: payload.input.status ?? "draft",
          loggedLabel: new Date(
            payload.input.loggedAt ?? item.createdAt,
          ).toLocaleString("fa-IR", { dateStyle: "medium", timeStyle: "short" }),
          setsCount: payload.input.sets?.length ?? 0,
          sets: (payload.input.sets ?? []).map((set) => ({
            exerciseId: set.exerciseId,
            reps: set.reps,
            weightKg: set.weightKg ?? null,
            durationSec: set.durationSec ?? null,
            distanceM: set.distanceM ?? null,
            rpe: set.rpe ?? null,
          })),
          note: payload.input.note ?? null,
          pain: payload.input.pain
            ? {
                score: payload.input.pain.score ?? null,
                bodyAreaKeys: payload.input.pain.bodyAreaKeys ?? [],
              }
            : null,
          planRevisionId: payload.input.planRevisionId ?? null,
          reviews: [],
        };
        logs.unshift(log);
      }
    } else if (log && payload.operation === "update") {
      if (payload.input.sets) {
        log.sets = payload.input.sets.map((set) => ({
          exerciseId: set.exerciseId,
          reps: set.reps,
          weightKg: set.weightKg ?? null,
          durationSec: set.durationSec ?? null,
          distanceM: set.distanceM ?? null,
          rpe: set.rpe ?? null,
        }));
        log.setsCount = log.sets.length;
      }
      if (payload.input.status) log.status = payload.input.status;
      if (payload.input.note !== undefined) log.note = payload.input.note;
      if (payload.input.pain !== undefined) {
        log.pain = payload.input.pain
          ? {
              score: payload.input.pain.score ?? null,
              bodyAreaKeys: payload.input.pain.bodyAreaKeys ?? [],
            }
          : null;
      }
    } else if (log && payload.operation !== "update") {
      log.status = payload.operation === "complete" ? "completed" : "skipped";
    }
    if (log) {
      log.syncState =
        item.status === "retryable_error" ||
        item.status === "rejected_needs_user"
          ? item.status
          : "queued";
    }
  }
  return { ...detail, logs };
}

export function AthleteWorkoutDetailGate({ planId }: { planId: string }) {
  const t = useTranslations("AthleteWorkouts");
  const { isAuthenticated, isReady } = useAuth();
  const loggingEnabled = useFeatureFlag("athlete.workout_logging");
  const [detail, setDetail] = useState<AthleteWorkoutPlanDetail | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setDetail(canUseDemoFixtureId(planId) ? DEMO_WORKOUT_DETAIL : null);
      if (!canUseDemoFixtureId(planId)) {
        setError("برای دریافت برنامه تمرینی وارد حساب شوید.");
      }
      return;
    }

    await flush().catch(() => undefined);
    const [plan, logs, offlineOperations] = await Promise.all([
      accountProgress.getWorkoutPlan(planId),
      accountProgress.listWorkoutLogs({ planId, page_size: 50 }),
      listPendingWorkoutOperations(planId),
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

    const serverDetail = mapWorkoutPlanDetail(plan, logs.result, nameById);
    await saveWorkoutPlanCache(planId, serverDetail).catch(() => undefined);
    setDetail(
      applyOfflineOperations(
        serverDetail,
        offlineOperations,
      ),
    );
  }, [isAuthenticated, planId]);

  useEffect(() => {
    if (!isReady) return;
    let cancelled = false;
    void load().catch(async () => {
      if (!cancelled) {
        const cached = await loadWorkoutPlanCache(planId);
        const operations = await listPendingWorkoutOperations(planId);
        setDetail(
          cached
            ? applyOfflineOperations(cached, operations)
            : canUseDemoFixtureId(planId)
              ? DEMO_WORKOUT_DETAIL
              : null,
        );
        if (!canUseDemoFixtureId(planId)) {
          setError(cached ? t("offlineCachedPlan") : t("loadFailed"));
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isReady, load, planId, t]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const handleOnline = () => {
      void flush()
        .then(() => load())
        .catch(() => undefined);
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [isAuthenticated, load]);

  if (!detail && error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-6 text-center text-danger">
        {error}
      </div>
    );
  }

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

  const refreshOfflineOverlay = async () => {
    const operations = await listPendingWorkoutOperations(planId);
    setDetail((current) =>
      current ? applyOfflineOperations(current, operations) : current,
    );
  };

  const run = async (action: () => Promise<boolean | void>) => {
    setPending(true);
    setError(null);
    try {
      const queuedOffline = await action();
      if (queuedOffline) {
        await refreshOfflineOverlay();
        setError(t("queuedOffline"));
      } else {
        await load();
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "عملیات ناموفق بود.");
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
                    durationSec: set.durationSec ?? undefined,
                    distanceM: set.distanceM ?? undefined,
                    rpe: set.rpe ?? undefined,
                  })),
                  {
                    exerciseId: input.exerciseId,
                    reps: input.reps,
                    weightKg: input.weightKg,
                    durationSec: input.durationSec,
                    distanceM: input.distanceM,
                    rpe: input.rpe,
                  },
                ];
                const updateInput = {
                  sets: nextSets,
                  status: "in_progress" as const,
                };
                try {
                  if (activeSession.id.startsWith("offline_")) {
                    throw new TypeError("offline");
                  }
                  await accountProgress.updateWorkoutLog(
                    activeSession.id,
                    updateInput,
                  );
                } catch (caught) {
                  if (!isNetworkFailure(caught)) throw caught;
                  await enqueueWorkoutOperation({
                    operation: "update",
                    planId,
                    localLogId: activeSession.id,
                    serverLogId: activeSession.id.startsWith("offline_")
                      ? undefined
                      : activeSession.id,
                    input: updateInput,
                  });
                  return true;
                }
              });
            }
          : undefined
      }
      onUpdateSet={
        canLog && activeSession
          ? async (index, setInput) => {
              await run(async () => {
                const sets: WorkoutLogSetInput[] = activeSession.sets.map(
                  (set, setIndex) =>
                    setIndex === index
                      ? setInput
                      : {
                          exerciseId: set.exerciseId,
                          reps: set.reps,
                          weightKg: set.weightKg ?? undefined,
                          durationSec: set.durationSec ?? undefined,
                          distanceM: set.distanceM ?? undefined,
                          rpe: set.rpe ?? undefined,
                        },
                );
                const input = { sets, status: "in_progress" as const };
                try {
                  if (activeSession.id.startsWith("offline_")) {
                    throw new TypeError("offline");
                  }
                  await accountProgress.updateWorkoutLog(activeSession.id, input);
                } catch (caught) {
                  if (!isNetworkFailure(caught)) throw caught;
                  await enqueueWorkoutOperation({
                    operation: "update",
                    planId,
                    localLogId: activeSession.id,
                    serverLogId: activeSession.id.startsWith("offline_")
                      ? undefined
                      : activeSession.id,
                    input,
                  });
                  return true;
                }
              });
            }
          : undefined
      }
      onRemoveSet={
        canLog && activeSession
          ? async (index) => {
              await run(async () => {
                const sets: WorkoutLogSetInput[] = activeSession.sets
                  .filter((_, setIndex) => setIndex !== index)
                  .map((set) => ({
                    exerciseId: set.exerciseId,
                    reps: set.reps,
                    weightKg: set.weightKg ?? undefined,
                    durationSec: set.durationSec ?? undefined,
                    distanceM: set.distanceM ?? undefined,
                    rpe: set.rpe ?? undefined,
                  }));
                const input = { sets, status: "in_progress" as const };
                try {
                  if (activeSession.id.startsWith("offline_")) {
                    throw new TypeError("offline");
                  }
                  await accountProgress.updateWorkoutLog(activeSession.id, input);
                } catch (caught) {
                  if (!isNetworkFailure(caught)) throw caught;
                  await enqueueWorkoutOperation({
                    operation: "update",
                    planId,
                    localLogId: activeSession.id,
                    serverLogId: activeSession.id.startsWith("offline_")
                      ? undefined
                      : activeSession.id,
                    input,
                  });
                  return true;
                }
              });
            }
          : undefined
      }
      onCompleteSession={
        canLog && activeSession
          ? async () => {
              await run(async () => {
                try {
                  if (activeSession.id.startsWith("offline_")) {
                    throw new TypeError("offline");
                  }
                  await accountProgress.completeWorkoutLog(activeSession.id);
                } catch (caught) {
                  if (!isNetworkFailure(caught)) throw caught;
                  await enqueueWorkoutOperation({
                    operation: "complete",
                    planId,
                    localLogId: activeSession.id,
                    serverLogId: activeSession.id.startsWith("offline_")
                      ? undefined
                      : activeSession.id,
                  });
                  return true;
                }
              });
            }
          : undefined
      }
      onRetryOfflineSync={
        activeSession?.syncState
          ? async () => {
              await retryWorkoutOperations(activeSession.id);
              await run(async () => {
                await flush();
              });
            }
          : undefined
      }
      onDiscardOfflineChanges={
        activeSession?.syncState
          ? async () => {
              await discardWorkoutOperations(activeSession.id);
              await load().catch(() => {
                setDetail((current) =>
                  current
                    ? {
                        ...current,
                        logs: activeSession.id.startsWith("offline_")
                          ? current.logs.filter(
                              (log) => log.id !== activeSession.id,
                            )
                          : current.logs.map((log) =>
                              log.id === activeSession.id
                                ? { ...log, syncState: undefined }
                                : log,
                            ),
                      }
                    : current,
                );
              });
            }
          : undefined
      }
      onSaveSessionDetails={
        canLog && activeSession
          ? async (input) => {
              await run(async () => {
                const update = {
                  note: input.note ?? null,
                  pain: input.pain ?? null,
                  status: "in_progress" as const,
                };
                try {
                  if (activeSession.id.startsWith("offline_")) {
                    throw new TypeError("offline");
                  }
                  await accountProgress.updateWorkoutLog(activeSession.id, update);
                } catch (caught) {
                  if (!isNetworkFailure(caught)) throw caught;
                  await enqueueWorkoutOperation({
                    operation: "update",
                    planId,
                    localLogId: activeSession.id,
                    serverLogId: activeSession.id.startsWith("offline_")
                      ? undefined
                      : activeSession.id,
                    input: update,
                  });
                  return true;
                }
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
                const localLogId = `offline_${createClientMutationId("log")}`;
                const createInput = {
                  planId,
                  sessionIndex: nextSessionIndex,
                  sets: [],
                  status: "draft" as const,
                  loggedAt: new Date().toISOString(),
                  clientMutationId: createClientMutationId("workout"),
                };
                let serverLogId: string | undefined;
                try {
                  const log = await accountProgress.createWorkoutLog(createInput);
                  serverLogId = log.id;
                } catch (caught) {
                  if (!isNetworkFailure(caught)) throw caught;
                  await enqueueWorkoutOperation({
                    operation: "create",
                    localLogId,
                    input: createInput,
                  });
                }
                try {
                  if (status === "completed") {
                    if (!serverLogId) throw new TypeError("offline");
                    await accountProgress.completeWorkoutLog(serverLogId);
                  } else if (status === "skipped") {
                    if (!serverLogId) throw new TypeError("offline");
                    await accountProgress.skipWorkoutLog(serverLogId);
                  }
                } catch (caught) {
                  if (!isNetworkFailure(caught)) throw caught;
                  await enqueueWorkoutOperation({
                    operation: status === "completed" ? "complete" : "skip",
                    planId,
                    localLogId,
                    serverLogId,
                  });
                  return true;
                }
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
                const localLogId = `offline_${createClientMutationId("log")}`;
                const input = {
                  planId,
                  sessionIndex: nextSessionIndex,
                  sets: [],
                  status: "draft" as const,
                  timing: { startedAt: new Date().toISOString() },
                  loggedAt: new Date().toISOString(),
                  clientMutationId: createClientMutationId("workout"),
                };
                try {
                  await accountProgress.createWorkoutLog(input);
                } catch (caught) {
                  if (!isNetworkFailure(caught)) throw caught;
                  await enqueueWorkoutOperation({
                    operation: "create",
                    localLogId,
                    input,
                  });
                  return true;
                }
              });
            }
          : undefined
      }
      pending={pending}
    />
  );
}
