"use client";

import { Button, Chip, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { StatsCard } from "@repo/ui/cards/StatsCard";
import { AreaLineChart } from "@repo/ui/kit/AreaLineChart";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type {
  CoachEarningsBreakdownRow,
  CoachSettlementState,
} from "../../lib/coach-earnings-data";
import { coachEarningsScreenStyles as styles } from "./CoachEarningsScreen.styles";
import type { CoachEarningsScreenProps } from "./CoachEarningsScreen.types";

const SETTLEMENT_CHIP_COLOR: Record<
  CoachSettlementState,
  "success" | "warning" | "default"
> = {
  paid: "success",
  processing: "warning",
  upcoming: "default",
};

const SETTLEMENT_LABEL_KEY: Record<CoachSettlementState, string> = {
  paid: "settlementPaid",
  processing: "settlementProcessing",
  upcoming: "settlementUpcoming",
};

function amountClass(kind: CoachEarningsBreakdownRow["kind"]) {
  if (kind === "deduction") return styles.rowAmountDeduction;
  if (kind === "net") return styles.rowAmountNet;
  return styles.rowAmount;
}

export function CoachEarningsScreen({ earnings }: CoachEarningsScreenProps) {
  const t = useTranslations("CoachEarnings");
  const router = useRouter();

  return (
    <AppLayout
      className={styles.root}
      header={
        <Header
          className="border-b-0 bg-background"
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.back()}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
        />
      }
    >
      <div className={styles.content}>
        <section className={styles.intro}>
          <Typography className={styles.introTitle} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.introSubtitle} type="body">
            {t("subtitle")}
          </Typography>
        </section>

        <section className={styles.balanceCard}>
          <Typography className={styles.balanceLabel} type="body-sm">
            {t("pendingPayout")}
          </Typography>
          <div className={styles.balanceRow}>
            <Typography className={styles.balanceValue} type="h1" weight="bold">
              {earnings.pendingPayoutLabel}
            </Typography>
            <Typography className={styles.balanceUnit} type="body-sm">
              {t("currency")}
            </Typography>
          </div>
          <Typography className={styles.balanceHint} type="body-sm">
            {earnings.pendingPayoutHint}
          </Typography>
        </section>

        <section className={styles.statsGrid}>
          <StatsCard
            chart="line"
            color="var(--stats-blue)"
            comparisonSeries={earnings.monthRevenueComparisonSeries}
            series={earnings.monthRevenueSeries}
            title={t("statMonthRevenue")}
            unit={t("statMonthRevenueUnit")}
            value={earnings.monthRevenueValue}
          />
          <StatsCard
            chart="bar"
            color="var(--stats-orange)"
            series={earnings.sessionsSeries}
            title={t("statSessions")}
            unit={t("statSessionsUnit")}
            value={earnings.sessionsValue}
          />
        </section>

        <section className={styles.section}>
          <Typography className={styles.sectionTitle} type="h4" weight="semibold">
            {t("trendTitle")}
          </Typography>
          <div className={styles.chartCard}>
            <AreaLineChart
              aria-label={t("trendChartLabel")}
              data={earnings.revenueTrend}
            />
          </div>
        </section>

        <section className={styles.section}>
          <Typography className={styles.sectionTitle} type="h4" weight="semibold">
            {t("breakdownTitle")}
          </Typography>
          <div className={styles.groupCard}>
            {earnings.breakdown.map((row) => (
              <div key={row.id}>
                <div className={styles.row}>
                  <Typography
                    className={
                      row.kind === "deduction"
                        ? styles.rowLabelMuted
                        : styles.rowLabel
                    }
                    type="body-sm"
                    weight={row.kind === "net" ? "semibold" : undefined}
                  >
                    {row.label}
                  </Typography>
                  <Typography
                    className={amountClass(row.kind)}
                    type="body-sm"
                    weight={row.kind === "net" ? "semibold" : undefined}
                  >
                    {row.amountLabel}
                  </Typography>
                </div>
                <div className={styles.divider} />
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <Typography className={styles.sectionTitle} type="h4" weight="semibold">
            {t("settlementsTitle")}
          </Typography>
          <div className={styles.groupCard}>
            {earnings.settlements.map((settlement) => (
              <div key={settlement.id}>
                <div className={styles.row}>
                  <div className={styles.rowBody}>
                    <Typography
                      className={styles.rowLabel}
                      type="body"
                      weight="semibold"
                    >
                      {settlement.periodLabel}
                    </Typography>
                    <Typography className={styles.rowLabelMuted} type="body-sm">
                      {settlement.amountLabel}
                    </Typography>
                  </div>
                  <Chip
                    color={SETTLEMENT_CHIP_COLOR[settlement.state]}
                    size="sm"
                    variant="soft"
                  >
                    <Chip.Label>
                      {t(SETTLEMENT_LABEL_KEY[settlement.state])}
                    </Chip.Label>
                  </Chip>
                </div>
                <div className={styles.divider} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
