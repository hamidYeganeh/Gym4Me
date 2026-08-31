"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import type { HealthAssessmentStatus } from "../../lib/health-assessment-data";
import { athleteHealthAssessmentScreenVariants } from "./AthleteHealthAssessmentScreen.styles";
import type { AthleteHealthAssessmentScreenProps } from "./AthleteHealthAssessmentScreen.types";

function statusLabel(
  t: ReturnType<typeof useTranslations<"AthleteHealthAssessment">>,
  status: HealthAssessmentStatus,
) {
  switch (status) {
    case "unsubmitted":
      return t("statusUnsubmitted");
    case "in_progress":
      return t("statusInProgress");
    case "submitted":
      return t("statusSubmitted");
    case "reviewed":
      return t("statusReviewed");
    default:
      return status;
  }
}

export function AthleteHealthAssessmentScreen({
  status,
  questions,
  answers,
  pending = false,
  message = null,
  error = null,
  onAnswer,
  onSubmit,
  className,
}: AthleteHealthAssessmentScreenProps) {
  const t = useTranslations("AthleteHealthAssessment");
  const styles = athleteHealthAssessmentScreenVariants();
  const router = useRouter();
  const readOnly = status === "submitted" || status === "reviewed";

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
        <section className={styles.intro()}>
          <Typography className={styles.introTitle()} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.introSubtitle()} type="body">
            {t("subtitle")}
          </Typography>
          <div className={styles.statusRow()}>
            <Typography className={styles.meta()} type="body-sm">
              {t("statusLabel")}
            </Typography>
            <Chip size="sm" variant="soft">
              <Chip.Label>{statusLabel(t, status)}</Chip.Label>
            </Chip>
          </div>
        </section>

        <div className={styles.list()}>
          {questions.map((question, index) => (
            <article className={styles.card()} key={question.id}>
              <Typography className={styles.question()} type="body" weight="medium">
                {index + 1}. {question.prompt}
              </Typography>
              <div className={styles.answerRow()}>
                <Button
                  isDisabled={readOnly || pending}
                  onPress={() => onAnswer(question.id, "yes")}
                  size="lg"
                  variant={answers[question.id] === "yes" ? "primary" : "outline"}
                >
                  {t("yes")}
                </Button>
                <Button
                  isDisabled={readOnly || pending}
                  onPress={() => onAnswer(question.id, "no")}
                  size="lg"
                  variant={answers[question.id] === "no" ? "primary" : "outline"}
                >
                  {t("no")}
                </Button>
              </div>
            </article>
          ))}
        </div>

        {!readOnly ? (
          <Button size="lg"
            fullWidth
            isDisabled={pending}
            onPress={() => void onSubmit()}
            variant="primary"
          >
            {t("submit")}
          </Button>
        ) : null}

        {message ? (
          <Typography className={styles.feedback()} type="body-sm">
            {message}
          </Typography>
        ) : null}
        {error ? (
          <Typography className={styles.error()} type="body-sm">
            {error}
          </Typography>
        ) : null}
      </div>
    </AppLayout>
  );
}
