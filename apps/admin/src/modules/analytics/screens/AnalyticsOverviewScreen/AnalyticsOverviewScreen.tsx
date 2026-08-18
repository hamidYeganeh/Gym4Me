import { useEffect, useState } from "react";
import { Typography } from "@heroui/react/typography";
import type { AdminAnalyticsOverview } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import { adminAnalytics } from "@/shared/lib/api";
import { overviewToDataset } from "../../lib/analytics-adapter";
import {
  ANALYTICS_DATA,
  type AnalyticsPeriod,
} from "../../lib/analytics-data";
import { AnalyticsAcquisitionSection } from "../../sections/AnalyticsAcquisitionSection";
import { AnalyticsBookingStatusSection } from "../../sections/AnalyticsBookingStatusSection";
import { AnalyticsFunnelSection } from "../../sections/AnalyticsFunnelSection";
import { AnalyticsGrowthSection } from "../../sections/AnalyticsGrowthSection";
import { AnalyticsKpiSection } from "../../sections/AnalyticsKpiSection";
import { AnalyticsMarketplaceSection } from "../../sections/AnalyticsMarketplaceSection";
import { AnalyticsRetentionSection } from "../../sections/AnalyticsRetentionSection";
import { analyticsOverviewScreenVariants } from "./AnalyticsOverviewScreen.styles";
import type { AnalyticsOverviewScreenProps } from "./AnalyticsOverviewScreen.types";

export function AnalyticsOverviewScreen({
  className,
}: AnalyticsOverviewScreenProps) {
  const t = useTranslations("Admin.Analytics");
  const styles = analyticsOverviewScreenVariants();
  const [period, setPeriod] = useState<AnalyticsPeriod>("week");
  const [overview, setOverview] = useState<AdminAnalyticsOverview | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    adminAnalytics
      .overview()
      .then((data) => {
        if (!cancelled) setOverview(data);
      })
      .catch(() => {
        // keep sample dataset when the endpoint is unavailable
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dataset = overview
    ? overviewToDataset(overview, period, ANALYTICS_DATA[period])
    : ANALYTICS_DATA[period];

  return (
    <AdminShell
      activeNavId="analytics"
      analyticsSection={{
        activePeriodId: period,
        onPeriodChange: setPeriod,
      }}
      className={className}
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("subtitle")}
          </Typography>
        </section>

        <AnalyticsKpiSection kpis={dataset.kpis} />

        <AnalyticsGrowthSection
          revenueTrend={dataset.revenueTrend}
          signupTrend={dataset.signupTrend}
        />

        <div className={styles.conversionGrid()}>
          <AnalyticsAcquisitionSection sources={dataset.acquisition} />
          <AnalyticsFunnelSection steps={dataset.funnel} />
        </div>

        <AnalyticsMarketplaceSection
          topClubs={dataset.topClubs}
          topCoaches={dataset.topCoaches}
        />

        <div className={styles.engagementGrid()}>
          <AnalyticsRetentionSection cohorts={dataset.retention} />
          <AnalyticsBookingStatusSection rows={dataset.bookingStatuses} />
        </div>
      </div>
    </AdminShell>
  );
}
