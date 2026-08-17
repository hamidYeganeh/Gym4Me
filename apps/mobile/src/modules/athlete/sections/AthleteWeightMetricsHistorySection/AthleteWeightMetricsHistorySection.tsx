"use client";

import { Link, Typography } from "@heroui/react";
import { MetricHistoryItem } from "@repo/ui/cards/MetricHistoryItem";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import {
  formatTimeFa,
  formatWeightKg,
  toPersianDigits,
} from "@/modules/athlete/lib/weight/format";
import { getRecentWeightHistory } from "@/modules/athlete/lib/weight/weight-history-data";
import { athleteWeightMetricsHistorySectionVariants } from "./AthleteWeightMetricsHistorySection.styles";
import type { AthleteWeightMetricsHistorySectionProps } from "./AthleteWeightMetricsHistorySection.types";

export function AthleteWeightMetricsHistorySection({
  onSeeAll,
  className,
}: AthleteWeightMetricsHistorySectionProps) {
  const t = useTranslations("WeightMetrics");
  const tHistory = useTranslations("WeightHistory");
  const styles = athleteWeightMetricsHistorySectionVariants();
  const history = useMemo(() => getRecentWeightHistory(3), []);
  const unit = t("unit");

  return (
    <section className={styles.root({ className })}>
      <div className={styles.header()}>
        <Typography className={styles.title()} type="h4" weight="semibold">
          {t("historyTitle")}
        </Typography>
        <Link className={styles.seeAll()} onPress={onSeeAll}>
          {t("seeAll")}
        </Link>
      </div>
      <div className={styles.list()}>
        {history.map((entry) => (
          <MetricHistoryItem
            alert={entry.showAlert ? tHistory("alertHeavier") : undefined}
            aria-label={`${t("historyEntry")}: ${formatWeightKg(entry.kg, unit)}`}
            key={entry.id}
            onPress={onSeeAll}
            subtitle={
              entry.status === "goalCompleted"
                ? tHistory("statusGoalCompleted")
                : tHistory("statusStepsLeft", {
                    count: toPersianDigits(entry.stepsLeft ?? 0),
                  })
            }
            time={formatTimeFa(entry.hours, entry.minutes)}
            value={formatWeightKg(entry.kg, unit)}
          />
        ))}
      </div>
    </section>
  );
}
