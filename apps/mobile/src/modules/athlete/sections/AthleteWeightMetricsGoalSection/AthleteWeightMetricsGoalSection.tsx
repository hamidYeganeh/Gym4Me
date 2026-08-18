"use client";

import { Link } from "@heroui/react/link";
import { Typography } from "@heroui/react/typography";
import { MetricGoalCard } from "@repo/ui/cards/MetricGoalCard";
import { useTranslations } from "next-intl";
import { athleteWeightMetricsGoalSectionVariants } from "./AthleteWeightMetricsGoalSection.styles";
import type { AthleteWeightMetricsGoalSectionProps } from "./AthleteWeightMetricsGoalSection.types";

export function AthleteWeightMetricsGoalSection({
  className,
}: AthleteWeightMetricsGoalSectionProps) {
  const t = useTranslations("WeightMetrics");
  const styles = athleteWeightMetricsGoalSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <div className={styles.header()}>
        <Typography className={styles.title()} type="h4" weight="semibold">
          {t("goalTitle")}
        </Typography>
        <Link className={styles.seeAll()} onPress={() => undefined}>
          {t("seeAll")}
        </Link>
      </div>
      <MetricGoalCard
        currentLabel={t("goalCurrent")}
        description={t("goalDescription")}
        editLabel={t("editGoal")}
        goalLabel={t("goalLabel")}
        goalValue={t("goalValue")}
        progress={30}
        progressLabel={t("goalProgress")}
      />
    </section>
  );
}
