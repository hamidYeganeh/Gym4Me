"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ChartBar1 } from "@repo/icons/ChartBar1";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { WeightScale } from "@repo/icons/WeightScale";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { EmptyState } from "@repo/ui/kit/EmptyState";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";

import { AthleteWeightMetricsChartSection } from "../../sections/AthleteWeightMetricsChartSection";
import { AthleteWeightMetricsGoalSection } from "../../sections/AthleteWeightMetricsGoalSection";
import { AthleteWeightMetricsHistorySection } from "../../sections/AthleteWeightMetricsHistorySection";
import { AthleteWeightMetricsInsightSection } from "../../sections/AthleteWeightMetricsInsightSection";
import { athleteWeightMetricsScreenVariants } from "./AthleteWeightMetricsScreen.styles";
import type { AthleteWeightMetricsScreenProps } from "./AthleteWeightMetricsScreen.types";

export function AthleteWeightMetricsScreen({
  metric,
}: AthleteWeightMetricsScreenProps) {
  const t = useTranslations("WeightMetrics");
  const tHistory = useTranslations("WeightHistory");
  const router = useRouter();
  const styles = athleteWeightMetricsScreenVariants();
  const historyHref = `/athlete/metrics/${metric}/history`;
  const unit = t("unit");

  return (
    <AppLayout
      className={styles.root()}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
          title={t("title")}
          endContent={
            <Button
              aria-label={t("analytics")}
              isIconOnly
              onPress={() => undefined}
              size="lg"
              variant="ghost"
            >
              <ChartBar1 className="text-foreground" size={22} />
            </Button>
          }
        />
      }
    >
      <div className={styles.content()}>
        <section className={styles.summary()}>
          <div className={styles.summaryRow()}>
            <span className={styles.summaryIcon()}>
              <WeightScale size={26} />
            </span>
            <div className={styles.summaryValueRow()}>
              <Typography className={styles.summaryValue()} weight="bold">
                {DEMO_MODE ? t("currentWeight") : "—"}
              </Typography>
              <Typography className={styles.summaryUnit()} weight="medium">
                {unit}
              </Typography>
            </div>
          </div>
          {DEMO_MODE ? (
            <Typography className={styles.summaryCaption()} type="body-sm">
              {t("rangeCaption")}
            </Typography>
          ) : null}
        </section>

        {DEMO_MODE ? (
          <>
            <AthleteWeightMetricsChartSection />
            <AthleteWeightMetricsInsightSection />
            <AthleteWeightMetricsHistorySection
              onSeeAll={() => router.push(historyHref)}
            />
            <AthleteWeightMetricsGoalSection />
          </>
        ) : (
          <EmptyState
            description={tHistory("emptyBody")}
            primaryAction={{
              label: t("seeAll"),
              onPress: () => router.push(historyHref),
            }}
            title={tHistory("emptyTitle")}
          />
        )}
      </div>
    </AppLayout>
  );
}
