"use client";

import { Typography } from "@heroui/react";
import { AreaLineChart } from "@repo/ui/kit/AreaLineChart";
import { useTranslations } from "next-intl";
import { coachClientDetailTrendSectionVariants } from "./CoachClientDetailTrendSection.styles";
import type { CoachClientDetailTrendSectionProps } from "./CoachClientDetailTrendSection.types";

export function CoachClientDetailTrendSection({
  trendPoints,
}: CoachClientDetailTrendSectionProps) {
  const t = useTranslations("CoachClientDetail");
  const styles = coachClientDetailTrendSectionVariants();

  return (
    <section className={styles.root()}>
      <Typography className={styles.title()} type="h4" weight="semibold">
        {t("trendTitle")}
      </Typography>
      <div className={styles.chartCard()}>
        <AreaLineChart
          aria-label={t("trendChartLabel")}
          data={trendPoints}
        />
      </div>
    </section>
  );
}
