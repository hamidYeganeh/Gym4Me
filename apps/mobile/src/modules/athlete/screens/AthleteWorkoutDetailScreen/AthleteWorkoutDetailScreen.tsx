"use client";

import { Button } from "@heroui/react/button";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useMemo, useState } from "react";
import { toPersianDigits } from "@/modules/athlete/lib/weight/format";
import type {
  AthleteWorkoutLogStatus,
  AthleteWorkoutPlanStatus,
} from "@/modules/athlete/lib/workout-programs-data";
import { AthleteWorkoutDetailIntroSection } from "@/modules/athlete/sections/AthleteWorkoutDetailIntroSection";
import { AthleteWorkoutDetailLogsSection } from "@/modules/athlete/sections/AthleteWorkoutDetailLogsSection";
import { AthleteWorkoutDetailSessionSection } from "@/modules/athlete/sections/AthleteWorkoutDetailSessionSection";
import { athleteWorkoutDetailScreenVariants } from "./AthleteWorkoutDetailScreen.styles";
import type { AthleteWorkoutDetailScreenProps } from "./AthleteWorkoutDetailScreen.types";

const PLAN_STATUS_KEY: Record<AthleteWorkoutPlanStatus, string> = {
  draft: "statusDraft",
  active: "statusActive",
  completed: "statusCompleted",
  archived: "statusArchived",
};

const LOG_STATUS_KEY: Record<AthleteWorkoutLogStatus, string> = {
  draft: "logDraft",
  in_progress: "logInProgress",
  completed: "logCompleted",
  skipped: "logSkipped",
  abandoned: "logAbandoned",
};

export function AthleteWorkoutDetailScreen({
  detail,
  activeSession = null,
  pending = false,
  error = null,
  onStartSession,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
  onCompleteSession,
  onRetryOfflineSync,
  onDiscardOfflineChanges,
  onSaveSessionDetails,
  onLogSession,
  className,
}: AthleteWorkoutDetailScreenProps) {
  const t = useTranslations("AthleteWorkouts");
  const styles = athleteWorkoutDetailScreenVariants();
  const router = useRouter();
  const [exerciseId, setExerciseId] = useState(
    detail.exercises[0]?.exerciseId ?? "",
  );
  const [reps, setReps] = useState("10");
  const [weightKg, setWeightKg] = useState("");
  const [durationSec, setDurationSec] = useState("");
  const [distanceM, setDistanceM] = useState("");
  const [rpe, setRpe] = useState("");
  const [painScore, setPainScore] = useState(
    activeSession?.pain?.score?.toString() ?? "",
  );
  const [painAreas, setPainAreas] = useState(
    activeSession?.pain?.bodyAreaKeys.join("، ") ?? "",
  );
  const [sessionNote, setSessionNote] = useState(activeSession?.note ?? "");
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);

  const cancelSetEdit = () => {
    setEditingSetIndex(null);
    setExerciseId(detail.exercises[0]?.exerciseId ?? "");
    setReps("10");
    setWeightKg("");
    setDurationSec("");
    setDistanceM("");
    setRpe("");
  };

  const exerciseLabel = useMemo(() => {
    const map = new Map(
      detail.exercises.map((item) => [item.exerciseId, item.label]),
    );
    return (id: string) => map.get(id) ?? id;
  }, [detail.exercises]);

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
        />
      }
    >
      <div className={styles.content()}>
        <AthleteWorkoutDetailIntroSection
          focusLabel={detail.focusLabel}
          periodLabel={detail.periodLabel}
          revisionLabel={t("revision", {
            number: toPersianDigits(detail.currentRevision ?? 1),
          })}
          statusLabel={t(PLAN_STATUS_KEY[detail.status])}
          title={detail.title}
        />

        {activeSession?.syncState ? (
          <section aria-live="polite" className="rounded-2xl border border-warning/40 bg-warning/10 p-3">
            <p className="text-sm">{t(
              activeSession.syncState === "rejected_needs_user"
                ? "syncNeedsRecoveryBody"
                : "syncPendingBody",
            )}</p>
            <div className="mt-2 flex gap-2">
              <Button onPress={() => void onRetryOfflineSync?.()} size="sm" variant="secondary">{t("retrySync")}</Button>
              <Button
                className="text-danger"
                onPress={() => {
                  if (window.confirm(t("discardOfflineConfirm"))) {
                    void onDiscardOfflineChanges?.();
                  }
                }}
                size="sm"
                variant="ghost"
              >{t("discardOffline")}</Button>
            </div>
          </section>
        ) : null}

        <AthleteWorkoutDetailSessionSection
          activeSession={activeSession}
          activeSessionLabel={t("activeSession", {
            index: toPersianDigits(activeSession?.sessionIndex ?? 0),
          }) + (activeSession?.syncState
            ? ` · ${t(
                activeSession.syncState === "rejected_needs_user"
                  ? "syncNeedsRecovery"
                  : activeSession.syncState === "retryable_error"
                    ? "syncRetryable"
                    : "syncQueued",
              )}`
            : "")}
          addSetLabel={t("addSet")}
          saveSetLabel={t("saveSet")}
          editSetLabel={t("editSet")}
          removeSetLabel={t("removeSet")}
          cancelEditLabel={t("cancelEdit")}
          completeSessionLabel={t("completeSession")}
          distanceM={distanceM}
          distanceMLabel={t("distanceM")}
          durationSec={durationSec}
          durationSecLabel={t("durationSec")}
          error={error}
          exerciseId={exerciseId}
          exerciseLabel={t("exercise")}
          exerciseLabelFor={exerciseLabel}
          exercises={detail.exercises}
          logStatusLabel={(status) => t(LOG_STATUS_KEY[status])}
          markCompletedLabel={t("markCompleted")}
          markSkippedLabel={t("markSkipped")}
          noSetsYetLabel={t("noSetsYet")}
          editingSetIndex={editingSetIndex}
          onAddSet={async (input) => {
            if (editingSetIndex == null) {
              await onAddSet?.(input);
            } else {
              await onUpdateSet?.(editingSetIndex, input);
              cancelSetEdit();
            }
          }}
          onCancelEdit={cancelSetEdit}
          onEditSet={(index) => {
            const set = activeSession?.sets[index];
            if (!set) return;
            setEditingSetIndex(index);
            setExerciseId(set.exerciseId);
            setReps(String(set.reps));
            setWeightKg(set.weightKg == null ? "" : String(set.weightKg));
            setDurationSec(set.durationSec == null ? "" : String(set.durationSec));
            setDistanceM(set.distanceM == null ? "" : String(set.distanceM));
            setRpe(set.rpe == null ? "" : String(set.rpe));
          }}
          onRemoveSet={async (index) => {
            await onRemoveSet?.(index);
            if (editingSetIndex === index) cancelSetEdit();
          }}
          onCompleteSession={onCompleteSession}
          onExerciseIdChange={setExerciseId}
          onDistanceMChange={setDistanceM}
          onDurationSecChange={setDurationSec}
          onLogSession={onLogSession}
          onRepsChange={setReps}
          onRpeChange={setRpe}
          onPainAreasChange={setPainAreas}
          onPainScoreChange={setPainScore}
          onSaveSessionDetails={onSaveSessionDetails}
          onSessionNoteChange={setSessionNote}
          onStartSession={onStartSession}
          onWeightKgChange={setWeightKg}
          pending={pending}
          painAreas={painAreas}
          painAreasHint={t("painAreasHint")}
          painAreasLabel={t("painAreas")}
          painScore={painScore}
          painScoreLabel={t("painScore")}
          reps={reps}
          repsLabel={t("reps")}
          rpe={rpe}
          rpeLabel={t("rpe")}
          saveSessionDetailsLabel={t("saveSessionDetails")}
          sessionNote={sessionNote}
          sessionNoteLabel={t("sessionNote")}
          startSessionLabel={t("startSession")}
          weightKg={weightKg}
          weightKgLabel={t("weightKg")}
        />

        <AthleteWorkoutDetailLogsSection
          coachFeedbackLabel={t("coachFeedback")}
          emptyBody={t("logsEmptyBody")}
          emptyTitle={t("logsEmptyTitle")}
          logStatusLabel={(status) => t(LOG_STATUS_KEY[status])}
          logs={detail.logs}
          sessionLabel={(index) =>
            t("session", { index: toPersianDigits(index) })
          }
          setsCountLabel={(count) =>
            t("setsCount", { count: toPersianDigits(count) })
          }
          title={t("logsTitle")}
        />
      </div>
    </AppLayout>
  );
}
