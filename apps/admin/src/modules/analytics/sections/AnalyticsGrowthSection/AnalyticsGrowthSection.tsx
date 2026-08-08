import { Card } from "@heroui/react";
import { AreaLineChart } from "@repo/ui/kit/AreaLineChart";
import { useTranslations } from "next-intl";
import { analyticsGrowthSectionVariants } from "./AnalyticsGrowthSection.styles";
import type { AnalyticsGrowthSectionProps } from "./AnalyticsGrowthSection.types";

export function AnalyticsGrowthSection({
  signupTrend,
  revenueTrend,
  className,
}: AnalyticsGrowthSectionProps) {
  const t = useTranslations("Admin.Analytics.growth");
  const styles = analyticsGrowthSectionVariants();

  const charts = [
    {
      id: "signups",
      title: t("signupsTitle"),
      description: t("signupsDescription"),
      ariaLabel: t("signupsChartAriaLabel"),
      data: signupTrend,
      color: "var(--stats-blue)",
    },
    {
      id: "revenue",
      title: t("revenueTitle"),
      description: t("revenueDescription"),
      ariaLabel: t("revenueChartAriaLabel"),
      data: revenueTrend,
      color: "var(--stats-purple)",
    },
  ];

  return (
    <div className={styles.root({ className })}>
      {charts.map((chart) => (
        <Card className={styles.card()} key={chart.id}>
          <Card.Header className={styles.cardHeader()}>
            <Card.Title className={styles.cardTitle()}>
              {chart.title}
            </Card.Title>
            <Card.Description className={styles.cardDescription()}>
              {chart.description}
            </Card.Description>
          </Card.Header>
          <Card.Content className={styles.chartContent()}>
            <AreaLineChart
              aria-label={chart.ariaLabel}
              className={styles.chart()}
              color={chart.color}
              data={chart.data}
            />
          </Card.Content>
        </Card>
      ))}
    </div>
  );
}
