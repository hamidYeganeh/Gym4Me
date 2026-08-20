"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import type { CoachNutritionMealSlot, CoachNutritionPlan } from "../../lib/coach-nutrition-data";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { coachNutritionPlanScreenStyles as styles } from "./CoachNutritionPlanScreen.styles";
import type { CoachNutritionPlanScreenProps } from "./CoachNutritionPlanScreen.types";

const MEAL_LABEL_KEY: Record<CoachNutritionMealSlot, string> = {
  breakfast: "mealBreakfast",
  lunch: "mealLunch",
  dinner: "mealDinner",
};

const STATUS_LABEL_KEY: Record<CoachNutritionPlan["status"], string> = {
  active: "statusActive",
  draft: "statusDraft",
  archived: "statusArchived",
};

export function CoachNutritionPlanScreen({ plan }: CoachNutritionPlanScreenProps) {
  const t = useTranslations("CoachNutrition");
  const router = useRouter();

  return (
    <AppLayout
      className={styles.root}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
          title={plan.title}
        />
      }
    >
      <div className={styles.content}>
        <section className={styles.intro}>
          <Typography className={styles.introTitle} type="h1" weight="bold">
            {plan.title}
          </Typography>
          <Typography className={styles.introSubtitle} type="body">
            {t("clientMeta", { client: plan.clientLabel })}
          </Typography>
          <Chip size="sm" variant="soft">
            <Chip.Label>{t(STATUS_LABEL_KEY[plan.status])}</Chip.Label>
          </Chip>
        </section>

        {plan.meals.map((meal) => (
          <article className={styles.mealCard} key={meal.id}>
            <Typography className={styles.mealTitle} type="h4" weight="semibold">
              {t(MEAL_LABEL_KEY[meal.slot])}
            </Typography>
            <Typography className={styles.mealMeta} type="body-sm">
              {t("caloriesMeta", { calories: meal.calories })}
            </Typography>
            <ul className="flex flex-col gap-1">
              {meal.items.map((item) => (
                <li className={styles.itemRow} key={item}>
                  <Typography type="body-sm">• {item}</Typography>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </AppLayout>
  );
}
