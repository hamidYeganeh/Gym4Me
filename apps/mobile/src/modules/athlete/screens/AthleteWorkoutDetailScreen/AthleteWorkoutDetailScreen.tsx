"use client";

import { Button, Chip, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
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
  completed: "logCompleted",
  skipped: "logSkipped",
};

export function AthleteWorkoutDetailScreen({
  detail,
  className,
}: AthleteWorkoutDetailScreenProps) {
  const t = useTranslations("AthleteWorkouts");
  const styles = athleteWorkoutDetailScreenVariants();
  const router = useRouter();

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
                      color={log.status === "completed" ? "success" : "warning"}
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
