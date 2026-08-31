"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import type { CoachNutritionPlan } from "../../lib/coach-nutrition-data";
import { coachNutritionScreenStyles as styles } from "./CoachNutritionScreen.styles";
import type { CoachNutritionScreenProps } from "./CoachNutritionScreen.types";

const STATUS_CHIP_COLOR: Record<
  CoachNutritionPlan["status"],
  "success" | "warning" | "default"
> = {
  active: "success",
  draft: "warning",
  archived: "default",
};

const STATUS_LABEL_KEY: Record<CoachNutritionPlan["status"], string> = {
  active: "statusActive",
  draft: "statusDraft",
  archived: "statusArchived",
};

export function CoachNutritionScreen({ plans }: CoachNutritionScreenProps) {
  const t = useTranslations("CoachNutrition");
  const router = useRouter();

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
            {t("listTitle")}
          </Typography>
          <Typography className={styles.introSubtitle} type="body">
            {t("listSubtitle")}
          </Typography>
        </section>

        {plans.length > 0 ? (
          <div className={styles.list}>
            {plans.map((plan) => (
              <Button size="lg"
                className={styles.card}
                key={plan.id}
                variant="ghost"
                onPress={() => router.push(`/coach/nutrition/${plan.id}`)}
              >
                <div className={styles.cardTop}>
                  <Typography type="body" weight="semibold">
                    {plan.title}
                  </Typography>
                  <Chip
                    color={STATUS_CHIP_COLOR[plan.status]}
                    size="sm"
                    variant="soft"
                  >
                    <Chip.Label>{t(STATUS_LABEL_KEY[plan.status])}</Chip.Label>
                  </Chip>
                </div>
                <Typography className={styles.cardMeta} type="body-sm">
                  {t("clientMeta", { client: plan.clientLabel })}
                </Typography>
                <Typography className={styles.cardMeta} type="body-sm">
                  {plan.updatedLabel}
                </Typography>
              </Button>
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
