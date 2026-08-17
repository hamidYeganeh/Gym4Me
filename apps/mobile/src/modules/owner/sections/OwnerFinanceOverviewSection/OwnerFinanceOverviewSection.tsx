"use client";

import { Typography } from "@heroui/react";
import { Wallet } from "@repo/icons/Wallet";
import { StatsCard } from "@repo/ui/cards/StatsCard";
import { AreaLineChart } from "@repo/ui/kit/AreaLineChart";
import { useTranslations } from "next-intl";
import { ownerFinanceOverviewSectionVariants } from "./OwnerFinanceOverviewSection.styles";
import type { OwnerFinanceOverviewSectionProps } from "./OwnerFinanceOverviewSection.types";

export function OwnerFinanceOverviewSection({
  finance,
  className,
}: OwnerFinanceOverviewSectionProps) {
  const t = useTranslations("OwnerFinance");
  const styles = ownerFinanceOverviewSectionVariants();

  return (
    <div className={styles.root({ className })}>
      <section className={styles.intro()}>
        <Typography className={styles.introTitle()} type="h1" weight="bold">
          {t("title")}
        </Typography>
        <Typography className={styles.introSubtitle()} type="body">
          {t("subtitle")}
        </Typography>
      </section>

      <section className={styles.hero()}>
        <div className={styles.heroHeader()}>
          <Wallet aria-hidden className={styles.heroIcon()} size={20} />
          <Typography className={styles.heroLabel()} type="body-sm">
            {t("pendingTitle")}
          </Typography>
        </div>
        <Typography className={styles.heroAmount()} type="h2" weight="bold">
          {finance.pendingAmountLabel}
        </Typography>
        <Typography className={styles.heroHint()} type="body-sm">
          {t("pendingHint")}: {finance.nextPayoutLabel}
        </Typography>
      </section>

      <div className={styles.statsGrid()}>
        <StatsCard
          chart="line"
          color={finance.revenueColor}
          comparisonSeries={finance.revenueComparisonSeries}
          series={finance.revenueSeries}
          title={t("statRevenueTitle")}
          unit={t("statRevenueUnit")}
          value={finance.revenueValue}
        />
        <StatsCard
          chart="bar"
          color={finance.refundColor}
          series={finance.refundSeries}
          title={t("statRefundTitle")}
          unit={t("statRefundUnit")}
          value={finance.refundValue}
        />
      </div>

      <div className={styles.chartCard()}>
        <Typography
          className={styles.chartTitle()}
          type="body"
          weight="semibold"
        >
          {t("revenueTrendTitle")}
        </Typography>
        <AreaLineChart
          aria-label={t("revenueTrendTitle")}
          className={styles.chart()}
          data={finance.revenueTrend}
        />
      </div>
    </div>
  );
}
