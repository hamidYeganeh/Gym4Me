"use client";

import {
  Button,
  Chip,
  Input,
  Label,
  TextField,
  Typography,
} from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toPersianDigits } from "@/modules/athlete/lib/weight/format";
import type {
  AthleteWorkoutLogStatus,
  AthleteWorkoutPlanStatus,
} from "@/modules/athlete/lib/workout-programs-data";
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
        <Header
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.back()}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
        />
      }
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.introTitle()} type="h1" weight="bold">
            {detail.title}
          </Typography>
          <Typography className={styles.introSubtitle()} type="body">
            {detail.focusLabel}
          </Typography>
          <div className={styles.metaRow()}>
            <Chip size="sm" variant="soft">
              <Chip.Label>{t(PLAN_STATUS_KEY[detail.status])}</Chip.Label>
            </Chip>
            <Typography className={styles.meta()} type="body-sm">
              {detail.periodLabel}
            </Typography>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          {onStartSession ? (
            <Button
              isDisabled={pending}
              onPress={() => void onStartSession()}
              variant="primary"
            >
              {t("startSession")}
            </Button>
          ) : null}

          {activeSession ? (
            <div className={styles.sessionCard()}>
              <div className={styles.cardTop()}>
                <Typography type="body" weight="semibold">
                  {t("activeSession", {
                    index: toPersianDigits(activeSession.sessionIndex),
                  })}
                </Typography>
                <Chip color="warning" size="sm" variant="soft">
                  <Chip.Label>
                    {t(LOG_STATUS_KEY[activeSession.status])}
                  </Chip.Label>
                </Chip>
              </div>

              {detail.exercises.length > 0 && onAddSet ? (
                <div className={styles.sessionForm()}>
                  <label className={styles.field()}>
                    <span className={styles.meta()}>{t("exercise")}</span>
                    <select
                      className={styles.nativeSelect()}
                      onChange={(event) => setExerciseId(event.target.value)}
                      value={exerciseId}
                    >
                      {detail.exercises.map((exercise) => (
                        <option
                          key={exercise.exerciseId}
                          value={exercise.exerciseId}
                        >
                          {exercise.label}
                          {exercise.plannedReps
                            ? ` · ${toPersianDigits(exercise.plannedSets)}×${toPersianDigits(exercise.plannedReps)}`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className={styles.sessionGrid()}>
                    <TextField>
                      <Label>{t("reps")}</Label>
                      <Input
                        inputMode="numeric"
                        min={1}
                        onChange={(event) => setReps(event.target.value)}
                        type="number"
                        value={reps}
                      />
                    </TextField>
                    <TextField>
                      <Label>{t("weightKg")}</Label>
                      <Input
                        inputMode="decimal"
                        min={0}
                        onChange={(event) => setWeightKg(event.target.value)}
                        type="number"
                        value={weightKg}
                      />
                    </TextField>
                  </div>
                  <Button
                    isDisabled={
                      pending ||
                      !exerciseId ||
                      !Number.isFinite(Number(reps)) ||
                      Number(reps) <= 0
                    }
                    onPress={() =>
                      void onAddSet({
                        exerciseId,
                        reps: Number(reps),
                        weightKg:
                          weightKg.trim() === ""
                            ? undefined
                            : Number(weightKg),
                      })
                    }
                    variant="secondary"
                  >
                    {t("addSet")}
                  </Button>
                </div>
              ) : null}

              {activeSession.sets.length > 0 ? (
                <div className={styles.setList()}>
                  {activeSession.sets.map((set, index) => (
                    <Typography
                      className={styles.meta()}
                      key={`${set.exerciseId}-${index}`}
                      type="body-sm"
                    >
                      {toPersianDigits(index + 1)}. {exerciseLabel(set.exerciseId)}{" "}
                      · {toPersianDigits(set.reps)} تکرار
                      {set.weightKg != null
                        ? ` · ${toPersianDigits(set.weightKg)} کیلوگرم`
                        : ""}
                    </Typography>
                  ))}
                </div>
              ) : (
                <Typography className={styles.meta()} type="body-sm">
                  {t("noSetsYet")}
                </Typography>
              )}

              {onCompleteSession ? (
                <Button
                  isDisabled={pending}
                  onPress={() => void onCompleteSession()}
                  variant="primary"
                >
                  {t("completeSession")}
                </Button>
              ) : null}
            </div>
          ) : null}

          {onLogSession && !activeSession ? (
            <div className="grid grid-cols-2 gap-2 rounded-3xl border border-border bg-surface p-3">
              <Button
                isDisabled={pending}
                onPress={() => void onLogSession("completed")}
                variant="outline"
              >
                {t("markCompleted")}
              </Button>
              <Button
                isDisabled={pending}
                onPress={() => void onLogSession("skipped")}
                variant="outline"
              >
                {t("markSkipped")}
              </Button>
            </div>
          ) : null}

          {error ? (
            <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <Typography className={styles.sectionTitle()} type="body-sm">
            {t("logsTitle")}
          </Typography>
          {detail.logs.length === 0 ? (
            <div className={styles.empty()}>
              <Typography type="h4" weight="semibold">
                {t("logsEmptyTitle")}
              </Typography>
              <Typography className={styles.meta()} type="body-sm">
                {t("logsEmptyBody")}
              </Typography>
            </div>
          ) : (
            <div className={styles.list()}>
              {detail.logs.map((log) => (
                <article className={styles.card()} key={log.id}>
                  <div className={styles.cardTop()}>
                    <Typography type="body" weight="semibold">
                      {t("session", {
                        index: toPersianDigits(log.sessionIndex),
                      })}
                    </Typography>
                    <Chip
                      color={
                        log.status === "completed"
                          ? "success"
                          : log.status === "draft" ||
                              log.status === "in_progress"
                            ? "warning"
                            : "default"
                      }
                      size="sm"
                      variant="soft"
                    >
                      <Chip.Label>{t(LOG_STATUS_KEY[log.status])}</Chip.Label>
                    </Chip>
                  </div>
                  <Typography className={styles.meta()} type="body-sm">
                    {log.loggedLabel} ·{" "}
                    {t("setsCount", { count: toPersianDigits(log.setsCount) })}
                  </Typography>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
