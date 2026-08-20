"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import type { MealAdherenceStatus } from "@repo/api/nutrition";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { toPersianDigits } from "@/modules/athlete/lib/weight/format";
import { athleteNutritionLogScreenVariants } from "./AthleteNutritionLogScreen.styles";
import type { AthleteNutritionLogScreenProps } from "./AthleteNutritionLogScreen.types";

const STATUS_KEY: Record<MealAdherenceStatus, string> = {
  followed: "adherenceFollowed",
  partial: "adherencePartial",
  skipped: "adherenceSkipped",
  substituted: "adherenceSubstituted",
};

const STATUS_COLOR: Record<
  MealAdherenceStatus,
  "success" | "warning" | "default"
> = {
  followed: "success",
  partial: "warning",
  skipped: "default",
  substituted: "warning",
};

export function AthleteNutritionLogScreen({
  logs,
  pending = false,
  onQuickLog,
  className,
}: AthleteNutritionLogScreenProps) {
  const t = useTranslations("AthleteNutrition");
  const styles = athleteNutritionLogScreenVariants();
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
            {t("logTitle")}
          </Typography>
          <Typography className={styles.introSubtitle()} type="body">
            {t("logSubtitle")}
          </Typography>
        </section>

        <div className={styles.quickActions()}>
          <Button
            isDisabled={pending}
            onPress={() => void onQuickLog("followed")}
            variant="primary"
          >
            {t("quickFollowed")}
          </Button>
          <Button
            isDisabled={pending}
            onPress={() => void onQuickLog("partial")}
            variant="secondary"
          >
            {t("quickPartial")}
          </Button>
          <Button
            isDisabled={pending}
            onPress={() => void onQuickLog("skipped")}
            variant="outline"
          >
            {t("quickSkipped")}
          </Button>
        </div>

        {logs.length === 0 ? (
          <div className={styles.empty()}>
            <Typography type="h4" weight="semibold">
              {t("logEmptyTitle")}
            </Typography>
            <Typography className={styles.meta()} type="body-sm">
              {t("logEmptyBody")}
            </Typography>
          </div>
        ) : (
          <div className={styles.list()}>
            {logs.map((log) => (
              <article className={styles.card()} key={log.id}>
                <div className={styles.cardTop()}>
                  <Typography type="body" weight="semibold">
                    {log.planTitle}
                  </Typography>
                  <Chip color={STATUS_COLOR[log.status]} size="sm" variant="soft">
                    <Chip.Label>{t(STATUS_KEY[log.status])}</Chip.Label>
                  </Chip>
                </div>
                <Typography className={styles.meta()} type="body-sm">
                  {t("slotLabel", {
                    day: toPersianDigits(log.dayIndex + 1),
                    meal: toPersianDigits(log.mealIndex + 1),
                  })}
                  {" · "}
                  {log.loggedLabel}
                </Typography>
                {log.note ? (
                  <Typography type="body-sm">{log.note}</Typography>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
