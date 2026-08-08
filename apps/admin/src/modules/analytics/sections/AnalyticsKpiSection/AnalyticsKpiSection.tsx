import { StatsCard } from "@repo/ui/cards/StatsCard";
import { useTranslations } from "next-intl";
import {
  formatFaNumber,
  formatFaPercent,
  type AnalyticsKpi,
  type AnalyticsKpiId,
} from "../../lib/analytics-data";
import { analyticsKpiSectionVariants } from "./AnalyticsKpiSection.styles";
import type { AnalyticsKpiSectionProps } from "./AnalyticsKpiSection.types";

const KPI_CHART: Record<AnalyticsKpiId, "line" | "bar"> = {
  activeUsers: "line",
  bookings: "bar",
  grossRevenue: "line",
  conversionRate: "line",
};

const KPI_COLOR: Record<AnalyticsKpiId, string> = {
  activeUsers: "var(--stats-blue)",
  bookings: "var(--stats-orange)",
  grossRevenue: "var(--stats-purple)",
  conversionRate: "var(--stats-yellow)",
};

function kpiValue(kpi: AnalyticsKpi): string {
  if (kpi.id === "conversionRate") {
    return formatFaPercent(kpi.value).replace("٪", "");
  }
  return formatFaNumber(kpi.value);
}

export function AnalyticsKpiSection({
  kpis,
  className,
}: AnalyticsKpiSectionProps) {
  const t = useTranslations("Admin.Analytics.kpi");
  const styles = analyticsKpiSectionVariants();

  return (
    <div className={styles.root({ className })}>
      {kpis.map((kpi) =>
        KPI_CHART[kpi.id] === "bar" ? (
          <StatsCard
            chart="bar"
            className={styles.card()}
            color={KPI_COLOR[kpi.id]}
            key={kpi.id}
            series={kpi.series}
            title={t(kpi.id)}
            unit={t(`${kpi.id}Unit`)}
            value={kpiValue(kpi)}
          />
        ) : (
          <StatsCard
            chart="line"
            className={styles.card()}
            color={KPI_COLOR[kpi.id]}
            comparisonSeries={kpi.comparisonSeries}
            key={kpi.id}
            series={kpi.series}
            title={t(kpi.id)}
            unit={t(`${kpi.id}Unit`)}
            value={kpiValue(kpi)}
          />
        ),
      )}
    </div>
  );
}
