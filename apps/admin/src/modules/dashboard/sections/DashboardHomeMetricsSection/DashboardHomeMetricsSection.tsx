import { Card } from "@heroui/react/card";
import { Typography } from "@heroui/react/typography";
import { dashboardHomeMetricsSectionVariants } from "./DashboardHomeMetricsSection.styles";
import type { DashboardHomeMetricsSectionProps } from "./DashboardHomeMetricsSection.types";

export function DashboardHomeMetricsSection({
  metrics,
  className,
}: DashboardHomeMetricsSectionProps) {
  const styles = dashboardHomeMetricsSectionVariants();

  return (
    <Card className={styles.metricsRail({ className })}>
      <Card.Content className={styles.metricsContent()}>
        {metrics.map((metric) => (
          <article className={styles.metric()} key={metric.label}>
            <div className={styles.metricTop()}>
              <span className={styles.metricIcon({ tone: metric.tone })}>
                {metric.icon}
              </span>
            </div>
            <Typography className={styles.metricValue()} type="h2">
              {metric.value}
            </Typography>
            <Typography className={styles.metricLabel()}>
              {metric.label}
            </Typography>
          </article>
        ))}
      </Card.Content>
    </Card>
  );
}
