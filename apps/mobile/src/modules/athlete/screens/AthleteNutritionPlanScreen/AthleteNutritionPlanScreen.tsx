"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import type { MealPlanStatus } from "@repo/api/nutrition";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toPersianDigits } from "@/modules/athlete/lib/weight/format";
import { athleteNutritionPlanScreenVariants } from "./AthleteNutritionPlanScreen.styles";
import type { AthleteNutritionPlanScreenProps } from "./AthleteNutritionPlanScreen.types";

const STATUS_KEY: Record<MealPlanStatus, string> = {
  draft: "statusDraft",
  active: "statusActive",
  archived: "statusArchived",
};

function formatMacros(item: {
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
}): string {
  const parts: string[] = [];
  if (item.calories != null) parts.push(`${toPersianDigits(item.calories)} kcal`);
  if (item.proteinG != null) parts.push(`P ${toPersianDigits(item.proteinG)}`);
  if (item.carbsG != null) parts.push(`C ${toPersianDigits(item.carbsG)}`);
  if (item.fatG != null) parts.push(`F ${toPersianDigits(item.fatG)}`);
  return parts.join(" · ");
}

export function AthleteNutritionPlanScreen({
  detail,
  pendingSlot,
  onLogMeal,
  className,
}: AthleteNutritionPlanScreenProps) {
  const t = useTranslations("AthleteNutrition");
  const styles = athleteNutritionPlanScreenVariants();
  const router = useRouter();

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
            {detail.title}
          </Typography>
          <Typography className={styles.introSubtitle()} type="body">
            {detail.coachLabel
              ? t("coachAssigned", { coach: detail.coachLabel })
              : t("selfPlan")}
          </Typography>
          <div className={styles.metaRow()}>
            <Chip size="sm" variant="soft">
              <Chip.Label>{t(STATUS_KEY[detail.status])}</Chip.Label>
            </Chip>
            <Typography className={styles.meta()} type="body-sm">
              {t("planMeta", {
                days: toPersianDigits(detail.daysCount),
                meals: toPersianDigits(detail.mealsCount),
              })}
            </Typography>
          </div>
        </section>

        {detail.days.length === 0 ? (
          <div className={styles.empty()}>
            <Typography type="h4" weight="semibold">
              {t("daysEmptyTitle")}
            </Typography>
            <Typography className={styles.meta()} type="body-sm">
              {t("daysEmptyBody")}
            </Typography>
          </div>
        ) : (
          detail.days.map((day) => (
            <section className={styles.dayCard()} key={day.dayIndex}>
              <Typography
                className={styles.dayTitle()}
                type="body"
                weight="semibold"
              >
                {t("dayLabel", { index: toPersianDigits(day.dayIndex + 1) })}
              </Typography>
              {day.meals.map((meal, mealIndex) => {
                const slotKey = `${day.dayIndex}:${mealIndex}`;
                return (
                  <div className={styles.meal()} key={`${day.dayIndex}-${mealIndex}`}>
                    <div className={styles.mealTop()}>
                      <Typography type="body" weight="semibold">
                        {meal.name}
                      </Typography>
                    </div>
                    {meal.items.map((item) => (
                      <div key={`${item.title}-${item.calories ?? 0}`}>
                        <Typography className={styles.item()} type="body-sm">
                          {item.title}
                        </Typography>
                        {formatMacros(item) ? (
                          <Typography className={styles.macros()} type="body-sm">
                            {formatMacros(item)}
                          </Typography>
                        ) : null}
                      </div>
                    ))}
                    <div className={styles.mealActions()}>
                      <Button
                        isDisabled={pendingSlot === slotKey}
                        onPress={() =>
                          void onLogMeal(day.dayIndex, mealIndex, "followed")
                        }
                        size="sm"
                        variant="secondary"
                      >
                        {t("logFollowed")}
                      </Button>
                      <Button
                        isDisabled={pendingSlot === slotKey}
                        onPress={() =>
                          void onLogMeal(day.dayIndex, mealIndex, "skipped")
                        }
                        size="sm"
                        variant="outline"
                      >
                        {t("logSkipped")}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </section>
          ))
        )}
      </div>
    </AppLayout>
  );
}
