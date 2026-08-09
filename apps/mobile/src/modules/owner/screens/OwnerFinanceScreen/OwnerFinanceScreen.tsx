"use client";

import { Button, Chip, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Wallet } from "@repo/icons/Wallet";
import { StatsCard } from "@repo/ui/cards/StatsCard";
import { AreaLineChart } from "@repo/ui/kit/AreaLineChart";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type {
  OwnerSettlementState,
  OwnerTransactionKind,
} from "../../lib/owner-finance-data";
import { ownerFinanceScreenStyles as styles } from "./OwnerFinanceScreen.styles";
import type { OwnerFinanceScreenProps } from "./OwnerFinanceScreen.types";

const SETTLEMENT_CHIP_COLOR: Record<
  OwnerSettlementState,
  "success" | "warning" | "accent"
> = {
  paid: "success",
  processing: "warning",
  upcoming: "accent",
};

const SETTLEMENT_LABEL_KEY = {
  paid: "statePaid",
  processing: "stateProcessing",
  upcoming: "stateUpcoming",
} as const;

const KIND_LABEL_KEY: Record<
  OwnerTransactionKind,
  "kindMembership" | "kindBooking" | "kindRefund"
> = {
  membership: "kindMembership",
  booking: "kindBooking",
  refund: "kindRefund",
};

export function OwnerFinanceScreen({
  finance,
  className,
}: OwnerFinanceScreenProps) {
  const t = useTranslations("OwnerFinance");
  const router = useRouter();

  return (
    <AppLayout
      className={[styles.root, className].filter(Boolean).join(" ")}
      header={
        <Header
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

        <section className={styles.hero}>
          <div className={styles.heroHeader}>
            <Wallet aria-hidden className={styles.heroIcon} size={20} />
            <Typography className={styles.heroLabel} type="body-sm">
              {t("pendingTitle")}
            </Typography>
          </div>
          <Typography className={styles.heroAmount} type="h2" weight="bold">
            {finance.pendingAmountLabel}
          </Typography>
          <Typography className={styles.heroHint} type="body-sm">
            {t("pendingHint")}: {finance.nextPayoutLabel}
          </Typography>
        </section>

        <div className={styles.statsGrid}>
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

        <div className={styles.chartCard}>
          <Typography
            className={styles.chartTitle}
            type="body"
            weight="semibold"
          >
            {t("revenueTrendTitle")}
          </Typography>
          <AreaLineChart
            aria-label={t("revenueTrendTitle")}
            className={styles.chart}
            data={finance.revenueTrend}
          />
        </div>

        <section className={styles.section}>
          <div>
            <Typography
              className={styles.sectionTitle}
              type="h4"
              weight="semibold"
            >
              {t("splitTitle")}
            </Typography>
            <Typography className={styles.sectionHint} type="body-sm">
              {t("splitHint")}
            </Typography>
          </div>
          <div className={styles.groupCard}>
            {finance.splitRows.map((row) => (
              <div key={row.id}>
                {row.isTotal ? (
                  <div aria-hidden className={styles.totalDivider} />
                ) : null}
                <div className={styles.row}>
                  <span className={styles.rowBody}>
                    <Typography
                      className={
                        row.isTotal ? styles.totalRowLabel : styles.rowLabel
                      }
                      type="body"
                      weight={row.isTotal ? "bold" : "medium"}
                    >
                      {row.label}
                    </Typography>
                  </span>
                  <span
                    className={
                      row.isTotal ? styles.rowValueBold : styles.rowValue
                    }
                  >
                    {row.amountLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <Typography
            className={styles.sectionTitle}
            type="h4"
            weight="semibold"
          >
            {t("settlementsTitle")}
          </Typography>
          <div className={styles.groupCard}>
            {finance.settlements.map((settlement, index) => (
              <div key={settlement.id}>
                <div className={styles.row}>
                  <span className={styles.rowBody}>
                    <Typography
                      className={styles.rowLabel}
                      type="body"
                      weight="medium"
                    >
                      {settlement.periodLabel}
                    </Typography>
                    <Typography className={styles.rowHint} type="body-sm">
                      {settlement.amountLabel}
                    </Typography>
                  </span>
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
                {index < finance.settlements.length - 1 ? (
                  <div aria-hidden className={styles.divider} />
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <Typography
            className={styles.sectionTitle}
            type="h4"
            weight="semibold"
          >
            {t("transactionsTitle")}
          </Typography>
          <div className={styles.groupCard}>
            {finance.transactions.map((transaction, index) => (
              <div key={transaction.id}>
                <div className={styles.row}>
                  <span className={styles.rowBody}>
                    <Typography
                      className={styles.rowLabel}
                      type="body"
                      weight="medium"
                    >
                      {transaction.title}
                    </Typography>
                    <Typography className={styles.rowHint} type="body-sm">
                      {t(KIND_LABEL_KEY[transaction.kind])} ·{" "}
                      {transaction.dateLabel}
                    </Typography>
                  </span>
                  <span
                    className={
                      transaction.direction === "credit"
                        ? styles.rowValueCredit
                        : styles.rowValueDebit
                    }
                  >
                    {transaction.direction === "credit" ? "+" : "−"}
                    {transaction.amountLabel}
                  </span>
                </div>
                {index < finance.transactions.length - 1 ? (
                  <div aria-hidden className={styles.divider} />
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
