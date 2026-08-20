"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ArrowDownLeft } from "@repo/icons/ArrowDownLeft";
import { ArrowUpRight } from "@repo/icons/ArrowUpRight";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { StatsCard } from "@repo/ui/cards/StatsCard";
import { TicketCard } from "@repo/ui/cards/TicketCard";
import { AreaLineChart } from "@repo/ui/kit/AreaLineChart";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { athleteWalletScreenStyles as styles } from "./AthleteWalletScreen.styles";
import type { AthleteWalletScreenProps } from "./AthleteWalletScreen.types";

const ROW_ICON_SIZE = 18;
const DEMO_INVOICE_ID = "inv-demo";

export function AthleteWalletScreen({
  balanceLabel,
  balancePoints,
  incomeSeries,
  spendSeries,
  transactionGroups,
  topUpPending = false,
  onTopUp,
}: AthleteWalletScreenProps) {
  const t = useTranslations("AthleteWallet");
  const router = useRouter();

  return (
    <AppLayout
      className={styles.root}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
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

        <TicketCard
          className={styles.balanceCard}
          subtitle={t("balanceLabel")}
          title={balanceLabel}
        />

        <Button
          fullWidth
          isDisabled={topUpPending}
          onPress={() => {
            if (onTopUp) {
              onTopUp();
              return;
            }
            router.push(`/athlete/payment/${DEMO_INVOICE_ID}`);
          }}
          size="lg"
          variant="primary"
        >
          {topUpPending ? t("topUpPending") : t("topUp")}
        </Button>

        <div className={styles.statsGrid}>
          <StatsCard
            aria-label={t("incomeTitle")}
            color="var(--stats-blue)"
            series={incomeSeries}
            title={t("incomeTitle")}
            value={t("incomeValue")}
            unit={t("currencyUnit")}
          />
          <StatsCard
            aria-label={t("spendTitle")}
            chart="bar"
            color="var(--stats-orange)"
            series={spendSeries}
            title={t("spendTitle")}
            value={t("spendValue")}
            unit={t("currencyUnit")}
          />
        </div>

        <section className={styles.section}>
          <Typography className={styles.sectionTitle} type="body-sm">
            {t("trendTitle")}
          </Typography>
          <div className={styles.trendCard}>
            <AreaLineChart aria-label={t("trendAria")} data={balancePoints} />
          </div>
        </section>

        <section className={styles.section}>
          <Typography className={styles.sectionTitle} type="body-sm">
            {t("transactionsTitle")}
          </Typography>
          {transactionGroups.length > 0 ? (
            <div className={styles.groups}>
              {transactionGroups.map((group) => (
                <div className={styles.group} key={group.id}>
                  <Typography className={styles.groupTitle} type="body-sm">
                    {group.dateLabel}
                  </Typography>
                  <div className={styles.groupCard}>
                    {group.items.map((transaction, index) => (
                      <div key={transaction.id}>
                        <div className={styles.row}>
                          <span
                            aria-hidden
                            className={
                              transaction.direction === "credit"
                                ? styles.rowIconCredit
                                : styles.rowIconDebit
                            }
                          >
                            {transaction.direction === "credit" ? (
                              <ArrowDownLeft size={ROW_ICON_SIZE} />
                            ) : (
                              <ArrowUpRight size={ROW_ICON_SIZE} />
                            )}
                          </span>
                          <span className={styles.rowBody}>
                            <Typography
                              className={styles.rowTitle}
                              type="body"
                              weight="medium"
                            >
                              {transaction.title}
                            </Typography>
                            <Typography className={styles.rowMeta} type="body-sm">
                              {transaction.timeLabel}
                            </Typography>
                          </span>
                          <Typography
                            className={
                              transaction.direction === "credit"
                                ? styles.rowAmountCredit
                                : styles.rowAmountDebit
                            }
                            type="body"
                            weight="semibold"
                          >
                            {transaction.amountLabel}
                          </Typography>
                        </div>
                        {index < group.items.length - 1 ? (
                          <div aria-hidden className={styles.divider} />
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <Typography className={styles.emptyBody} type="body-sm">
                {t("emptyTransactions")}
              </Typography>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
