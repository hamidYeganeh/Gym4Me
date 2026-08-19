"use client";

import { useState } from "react";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { PlayCircle } from "@repo/icons/PlayCircle";
import type { CoachVideoFeedbackStatus } from "../../lib/coach-video-feedback-data";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { coachVideoFeedbackScreenStyles as styles } from "./CoachVideoFeedbackScreen.styles";
import type { CoachVideoFeedbackScreenProps } from "./CoachVideoFeedbackScreen.types";

const STATUS_CHIP_COLOR: Record<
  CoachVideoFeedbackStatus,
  "success" | "warning"
> = {
  awaiting_review: "warning",
  reviewed: "success",
};

const STATUS_LABEL_KEY: Record<CoachVideoFeedbackStatus, string> = {
  awaiting_review: "statusAwaiting",
  reviewed: "statusReviewed",
};

export function CoachVideoFeedbackScreen({
  submissions,
  reviewingId = null,
  onSubmitReview,
}: CoachVideoFeedbackScreenProps) {
  const t = useTranslations("CoachVideoFeedback");
  const router = useRouter();
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});

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

        {submissions.length > 0 ? (
          <div className={styles.list}>
            {submissions.map((submission) => (
              <article className={styles.card} key={submission.id}>
                <div className={styles.cardTop}>
                  <Typography type="body" weight="semibold">
                    {submission.athleteName}
                  </Typography>
                  <Chip
                    color={STATUS_CHIP_COLOR[submission.status]}
                    size="sm"
                    variant="soft"
                  >
                    <Chip.Label>
                      {t(STATUS_LABEL_KEY[submission.status])}
                    </Chip.Label>
                  </Chip>
                </div>
                <Typography className={styles.cardMeta} type="body-sm">
                  {submission.exerciseName}
                </Typography>
                <Typography className={styles.cardMeta} type="body-sm">
                  {submission.submittedLabel}
                </Typography>
                <div className={styles.thumb}>
                  <PlayCircle size={32} />
                  <Typography className="ms-2" type="body-sm">
                    {submission.thumbnailLabel}
                  </Typography>
                </div>
                {submission.status === "reviewed" ? (
                  <Typography className={styles.reviewNote} type="body-sm">
                    {submission.reviewNote}
                  </Typography>
                ) : onSubmitReview ? (
                  <form
                    className={styles.form}
                    onSubmit={(event) => {
                      event.preventDefault();
                      const note = draftNotes[submission.id]?.trim();
                      if (!note) return;
                      void Promise.resolve(
                        onSubmitReview(submission.id, note),
                      ).then(() => {
                        setDraftNotes((current) => ({
                          ...current,
                          [submission.id]: "",
                        }));
                      });
                    }}
                  >
                    <TextField>
                      <Label>{t("reviewLabel")}</Label>
                      <Input
                        onChange={(event) =>
                          setDraftNotes((current) => ({
                            ...current,
                            [submission.id]: event.target.value,
                          }))
                        }
                        placeholder={t("reviewPlaceholder")}
                        value={draftNotes[submission.id] ?? ""}
                      />
                    </TextField>
                    <Button
                      isDisabled={
                        reviewingId === submission.id ||
                        !draftNotes[submission.id]?.trim()
                      }
                      type="submit"
                      variant="primary"
                    >
                      {reviewingId === submission.id
                        ? t("submittingReview")
                        : t("submitReview")}
                    </Button>
                  </form>
                ) : null}
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
