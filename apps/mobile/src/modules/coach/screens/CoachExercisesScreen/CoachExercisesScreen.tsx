"use client";

import { useState } from "react";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import type { CoachExerciseVerificationStatus } from "../../lib/coach-exercises-data";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { coachExercisesScreenStyles as styles } from "./CoachExercisesScreen.styles";
import type { CoachExercisesScreenProps } from "./CoachExercisesScreen.types";

const STATUS_CHIP_COLOR: Record<
  CoachExerciseVerificationStatus,
  "success" | "warning" | "danger" | "default"
> = {
  approved: "success",
  pending: "warning",
  draft: "default",
  rejected: "danger",
};

const STATUS_LABEL_KEY: Record<CoachExerciseVerificationStatus, string> = {
  approved: "statusApproved",
  pending: "statusPending",
  draft: "statusDraft",
  rejected: "statusRejected",
};

export function CoachExercisesScreen({
  exercises,
  submitting = false,
  onSubmitExercise,
}: CoachExercisesScreenProps) {
  const t = useTranslations("CoachExercises");
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <AppLayout
      className={styles.root}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
          title={t("title")}
        />
      }
    >
      <div className={styles.content}>
        <section className={styles.intro}>
          <Typography className={styles.introTitle} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.introSubtitle} type="body">
            {t("subtitle")}
          </Typography>
        </section>

        {onSubmitExercise ? (
          <>
            {!showForm ? (
              <Button onPress={() => setShowForm(true)} variant="primary">
                {t("createAction")}
              </Button>
            ) : (
              <form
                className={styles.form}
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!name.trim() || !muscleGroup.trim()) return;
                  void Promise.resolve(
                    onSubmitExercise({
                      name: name.trim(),
                      muscleGroup: muscleGroup.trim(),
                      notes: notes.trim() || undefined,
                    }),
                  ).then(() => {
                    setName("");
                    setMuscleGroup("");
                    setNotes("");
                    setShowForm(false);
                  });
                }}
              >
                <TextField>
                  <Label>{t("nameLabel")}</Label>
                  <Input
                    onChange={(event) => setName(event.target.value)}
                    placeholder={t("namePlaceholder")}
                    value={name}
                  />
                </TextField>
                <TextField>
                  <Label>{t("muscleGroupLabel")}</Label>
                  <Input
                    onChange={(event) => setMuscleGroup(event.target.value)}
                    placeholder={t("muscleGroupPlaceholder")}
                    value={muscleGroup}
                  />
                </TextField>
                <TextField>
                  <Label>{t("notesLabel")}</Label>
                  <Input
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder={t("notesPlaceholder")}
                    value={notes}
                  />
                </TextField>
                <div className={styles.formActions}>
                  <Button
                    isDisabled={submitting}
                    onPress={() => setShowForm(false)}
                    variant="ghost"
                  >
                    {t("createCancel")}
                  </Button>
                  <Button
                    isDisabled={submitting || !name.trim() || !muscleGroup.trim()}
                    type="submit"
                    variant="primary"
                  >
                    {submitting ? t("submitting") : t("createSubmit")}
                  </Button>
                </div>
              </form>
            )}
          </>
        ) : null}

        {exercises.length > 0 ? (
          <div className={styles.list}>
            {exercises.map((exercise) => (
              <article className={styles.card} key={exercise.id}>
                <div className={styles.cardTop}>
                  <Typography type="body" weight="semibold">
                    {exercise.name}
                  </Typography>
                  <Chip
                    color={STATUS_CHIP_COLOR[exercise.status]}
                    size="sm"
                    variant="soft"
                  >
                    <Chip.Label>
                      {t(STATUS_LABEL_KEY[exercise.status])}
                    </Chip.Label>
                  </Chip>
                </div>
                <Typography className={styles.cardMeta} type="body-sm">
                  {t("muscleGroupMeta", { group: exercise.muscleGroup })}
                </Typography>
                {exercise.notes ? (
                  <Typography className={styles.cardMeta} type="body-sm">
                    {exercise.notes}
                  </Typography>
                ) : null}
                <Typography className={styles.cardMeta} type="body-sm">
                  {exercise.updatedLabel}
                </Typography>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <Typography type="h4" weight="semibold">
              {t("emptyTitle")}
            </Typography>
            <Typography className="text-muted" type="body-sm">
              {t("emptyBody")}
            </Typography>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
