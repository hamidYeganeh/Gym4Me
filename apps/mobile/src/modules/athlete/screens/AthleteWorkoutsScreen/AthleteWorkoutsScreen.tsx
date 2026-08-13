"use client";

import { Button, Chip, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { AthleteWorkoutPlanStatus } from "@/modules/athlete/lib/workout-programs-data";
import { athleteWorkoutsScreenVariants } from "./AthleteWorkoutsScreen.styles";
import type { AthleteWorkoutsScreenProps } from "./AthleteWorkoutsScreen.types";

const STATUS_KEY: Record<AthleteWorkoutPlanStatus, string> = {
  draft: "statusDraft",
  active: "statusActive",
  completed: "statusCompleted",
  archived: "statusArchived",
};

const STATUS_COLOR: Record<
  AthleteWorkoutPlanStatus,
  "warning" | "success" | "default"
> = {
  draft: "warning",
  active: "success",
  completed: "default",
  archived: "default",
};

export function AthleteWorkoutsScreen({
  plans,
  className,
}: AthleteWorkoutsScreenProps) {
  const t = useTranslations("AthleteWorkouts");
  const styles = athleteWorkoutsScreenVariants();
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
            {t("title")}
          </Typography>
          <Typography className={styles.introSubtitle()} type="body">
            {t("subtitle")}
          </Typography>
        </section>

        {plans.length === 0 ? (
          <div className={styles.empty()}>
            <Typography type="h4" weight="semibold">
              {t("emptyTitle")}
            </Typography>
            <Typography className={styles.meta()} type="body-sm">
              {t("emptyBody")}
            </Typography>
          </div>
        ) : (
          <div className={styles.list()}>
            {plans.map((plan) => (
              <button
                className={styles.card()}
                key={plan.id}
                onClick={() => router.push(`/athlete/workouts/${plan.id}`)}
                type="button"
              >
                <div className={styles.cardTop()}>
                  <Typography
                    className={styles.title()}
                    type="body"
                    weight="semibold"
                  >
                    {plan.title}
                  </Typography>
                  <Chip color={STATUS_COLOR[plan.status]} size="sm" variant="soft">
                    <Chip.Label>{t(STATUS_KEY[plan.status])}</Chip.Label>
                  </Chip>
                </div>
                <Typography className={styles.focus()} type="body-sm">
                  {plan.focusLabel}
                </Typography>
                <Typography className={styles.meta()} type="body-sm">
                  {plan.periodLabel} · {t("updated", { date: plan.updatedLabel })}
                </Typography>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
