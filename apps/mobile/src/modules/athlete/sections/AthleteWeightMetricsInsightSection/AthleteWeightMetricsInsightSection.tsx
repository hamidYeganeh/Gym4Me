"use client";

import { Link, Typography } from "@heroui/react";
import { MetricInsightCard } from "@repo/ui/cards/MetricInsightCard";
import { useTranslations } from "next-intl";
import { athleteWeightMetricsInsightSectionVariants } from "./AthleteWeightMetricsInsightSection.styles";
import type { AthleteWeightMetricsInsightSectionProps } from "./AthleteWeightMetricsInsightSection.types";

const INSIGHT_SERIES = [42, 40, 38, 36, 35, 33, 32.8];

export function AthleteWeightMetricsInsightSection({
  className,
}: AthleteWeightMetricsInsightSectionProps) {
  const t = useTranslations("WeightMetrics");
  const styles = athleteWeightMetricsInsightSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <div className={styles.header()}>
        <Typography className={styles.title()} type="h4" weight="semibold">
          {t("insightTitle")}
        </Typography>
        <Link className={styles.seeAll()} onPress={() => undefined}>
          {t("seeAll")}
        </Link>
      </div>
      <MetricInsightCard
        changeLabel={t("bodyFatChange")}
        label={t("bodyFat")}
        series={INSIGHT_SERIES}
        tip={t("insightTip")}
        trendColor="var(--stats-red)"
        value={t("bodyFatValue")}
      />
    </section>
  );
}
