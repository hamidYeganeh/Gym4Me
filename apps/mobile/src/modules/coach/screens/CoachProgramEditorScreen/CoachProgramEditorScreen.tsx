"use client";

import { useState } from "react";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { Plus } from "@repo/icons/Plus";
import type { CoachProgramState } from "../../lib/coach-programs-data";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { coachProgramEditorScreenStyles as styles } from "./CoachProgramEditorScreen.styles";
import type { CoachProgramEditorScreenProps } from "./CoachProgramEditorScreen.types";

const STATE_CHIP_COLOR: Record<
  CoachProgramState,
  "success" | "warning" | "default"
> = {
  published: "success",
  draft: "warning",
  archived: "default",
};

const STATE_LABEL_KEY: Record<CoachProgramState, string> = {
  published: "statePublished",
  draft: "stateDraft",
  archived: "stateArchived",
};

export function CoachProgramEditorScreen({
  program,
  mode,
  publishing = false,
  onPublish,
  onAddExercise,
}: CoachProgramEditorScreenProps) {
  const t = useTranslations("CoachProgramEditor");
  const router = useRouter();
  const [addingSessionId, setAddingSessionId] = useState<string | null>(null);
  const isEdit = mode === "edit";

  return (
    <AppLayout
      className={styles.root}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
          title={program.title}
        />
      }
    >
      <div className={styles.content}>
        <section className={styles.intro}>
          <div className="flex items-center gap-2">
            <Typography className={styles.introTitle} type="h1" weight="bold">
              {program.title}
            </Typography>
            <Chip
              color={STATE_CHIP_COLOR[program.state]}
              size="sm"
              variant="soft"
            >
              <Chip.Label>{t(STATE_LABEL_KEY[program.state])}</Chip.Label>
            </Chip>
          </div>
          <Typography className={styles.introSubtitle} type="body">
            {program.focusLabel}
          </Typography>
          <Typography className={styles.introSubtitle} type="body-sm">
            {isEdit ? t("editSubtitle") : t("viewSubtitle")}
          </Typography>
        </section>

        <div className={styles.linkRow}>
          {!isEdit ? (
            <Button
              onPress={() => router.push(`/coach/programs/${program.id}/edit`)}
              variant="secondary"
            >
              {t("editAction")}
            </Button>
          ) : null}
          <Button
            onPress={() =>
              router.push(`/coach/programs/${program.id}/revisions`)
            }
            variant="ghost"
          >
            {t("revisionsAction")}
          </Button>
        </div>

        {program.weeks.map((week) => (
          <article className={styles.weekCard} key={week.id}>
            <Typography
              className={styles.weekTitle}
              type="h4"
              weight="semibold"
            >
              {week.label}
            </Typography>
            {week.days.map((day) => (
              <div className={styles.dayCard} key={day.id}>
                <Typography
                  className={styles.dayTitle}
                  type="body"
                  weight="semibold"
                >
                  {day.label}
                </Typography>
                {day.sessions.map((session) => (
                  <div className={styles.sessionCard} key={session.id}>
                    <Typography
                      className={styles.sessionTitle}
                      type="body-sm"
                      weight="semibold"
                    >
                      {session.title}
                    </Typography>
                    {session.exercises.map((exercise) => (
                      <div className={styles.exerciseRow} key={exercise.id}>
                        <Typography type="body-sm" weight="medium">
                          {exercise.name}
                        </Typography>
                        <Typography
                          className={styles.exerciseMeta}
                          type="body-sm"
                        >
                          {t("exerciseMeta", {
                            sets: exercise.sets,
                            reps: exercise.reps,
                          })}
                        </Typography>
                      </div>
                    ))}
                    {isEdit && onAddExercise ? (
                      <Button
                        className={styles.addRow}
                        isDisabled={addingSessionId === session.id}
                        onPress={() => {
                          setAddingSessionId(session.id);
                          void Promise.resolve(
                            onAddExercise(session.id),
                          ).finally(() => setAddingSessionId(null));
                        }}
                        size="sm"
                        variant="ghost"
                      >
                        <Plus size={16} />
                        {addingSessionId === session.id
                          ? t("addingExercise")
                          : t("addExercise")}
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            ))}
          </article>
        ))}

        {program.state === "draft" && onPublish ? (
          <section className={styles.actions}>
            <Button
              fullWidth
              isDisabled={publishing}
              onPress={() => {
                void Promise.resolve(onPublish());
              }}
              variant="primary"
            >
              {publishing ? t("publishing") : t("publishAction")}
            </Button>
          </section>
        ) : null}
      </div>
    </AppLayout>
  );
}
