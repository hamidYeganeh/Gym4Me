"use client";

import { Button } from "@heroui/react/button";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
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
  onCompleteSession,
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
          statusLabel={t(PLAN_STATUS_KEY[detail.status])}
          title={detail.title}
        />

        <AthleteWorkoutDetailSessionSection
          activeSession={activeSession}
          activeSessionLabel={t("activeSession", {
            index: toPersianDigits(activeSession?.sessionIndex ?? 0),
          })}
          addSetLabel={t("addSet")}
          completeSessionLabel={t("completeSession")}
          error={error}
          exerciseId={exerciseId}
          exerciseLabel={t("exercise")}
          exerciseLabelFor={exerciseLabel}
          exercises={detail.exercises}
          logStatusLabel={(status) => t(LOG_STATUS_KEY[status])}
          markCompletedLabel={t("markCompleted")}
          markSkippedLabel={t("markSkipped")}
          noSetsYetLabel={t("noSetsYet")}
          onAddSet={onAddSet}
          onCompleteSession={onCompleteSession}
          onExerciseIdChange={setExerciseId}
          onLogSession={onLogSession}
          onRepsChange={setReps}
          onStartSession={onStartSession}
          onWeightKgChange={setWeightKg}
          pending={pending}
          reps={reps}
          repsLabel={t("reps")}
          startSessionLabel={t("startSession")}
          weightKg={weightKg}
          weightKgLabel={t("weightKg")}
        />

        <AthleteWorkoutDetailLogsSection
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
