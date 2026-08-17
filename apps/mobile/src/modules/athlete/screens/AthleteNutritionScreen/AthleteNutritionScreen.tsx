"use client";

import { Button, Chip, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { MealPlanStatus } from "@repo/api/nutrition";
import { toPersianDigits } from "@/modules/athlete/lib/weight/format";
import { athleteNutritionScreenVariants } from "./AthleteNutritionScreen.styles";
import type { AthleteNutritionScreenProps } from "./AthleteNutritionScreen.types";

const STATUS_KEY: Record<MealPlanStatus, string> = {
  draft: "statusDraft",
  active: "statusActive",
  archived: "statusArchived",
};

const STATUS_COLOR: Record<
  MealPlanStatus,
  "warning" | "success" | "default"
> = {
  draft: "warning",
  active: "success",
  archived: "default",
};

export function AthleteNutritionScreen({
  plans,
  className,
}: AthleteNutritionScreenProps) {
  const t = useTranslations("AthleteNutrition");
  const styles = athleteNutritionScreenVariants();
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

        <div className={styles.toolbar()}>
          <Button
            fullWidth
            onPress={() => router.push("/athlete/nutrition/log")}
            variant="secondary"
          >
            {t("foodLog")}
          </Button>
        </div>

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
              <Button
                className={styles.card()}
                key={plan.id}
                variant="ghost"
                onPress={() => router.push(`/athlete/nutrition/${plan.id}`)}
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
                <Typography className={styles.meta()} type="body-sm">
                  {t("planMeta", {
                    days: toPersianDigits(plan.daysCount),
                    meals: toPersianDigits(plan.mealsCount),
                  })}
                </Typography>
                <Typography className={styles.meta()} type="body-sm">
                  {plan.coachLabel
                    ? t("coachAssigned", { coach: plan.coachLabel })
                    : t("selfPlan")}
                  {" · "}
                  {t("updated", { date: plan.updatedLabel })}
                </Typography>
              </Button>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
