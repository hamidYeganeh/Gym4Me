"use client";

import { StatsCard } from "@repo/ui/cards/StatsCard";
import { useTranslations } from "next-intl";
import { coachClientDetailStatsSectionVariants } from "./CoachClientDetailStatsSection.styles";
import type { CoachClientDetailStatsSectionProps } from "./CoachClientDetailStatsSection.types";

export function CoachClientDetailStatsSection({
  monthlySessionsSeries,
  monthlySessionsValue,
  adherenceSeries,
  adherenceValue,
}: CoachClientDetailStatsSectionProps) {
  const t = useTranslations("CoachClientDetail");
  const styles = coachClientDetailStatsSectionVariants();

  return (
    <section className={styles.root()}>
      <StatsCard
        chart="bar"
        color="var(--stats-purple)"
        series={monthlySessionsSeries}
        title={t("statSessions")}
        value={monthlySessionsValue}
        unit={t("statSessionsUnit")}
      />
      <StatsCard
        chart="line"
        color="var(--stats-blue)"
        series={adherenceSeries}
        title={t("statAdherence")}
        value={adherenceValue}
        unit={t("statAdherenceUnit")}
      />
    </section>
  );
}
