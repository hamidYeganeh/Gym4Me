import { Card } from "@heroui/react/card";
import { Typography } from "@heroui/react/typography";
import { dashboardHomeStatsSectionVariants } from "./DashboardHomeStatsSection.styles";
import type { DashboardHomeStatsSectionProps } from "./DashboardHomeStatsSection.types";

export function DashboardHomeStatsSection({
  title,
  description,
  stats,
  className,
}: DashboardHomeStatsSectionProps) {
  const styles = dashboardHomeStatsSectionVariants();

  return (
    <Card className={styles.activityCard({ className })}>
      <Card.Header className={styles.cardHeader()}>
        <div>
          <Card.Title className={styles.cardTitle()}>{title}</Card.Title>
          <Card.Description className={styles.cardDescription()}>
            {description}
          </Card.Description>
        </div>
      </Card.Header>
      <Card.Content className={styles.metricsContent()}>
        {stats.map((stat) => (
          <article className={styles.metric()} key={stat.label}>
            <Typography className={styles.metricValue()} type="h3">
              {stat.value}
            </Typography>
            <Typography className={styles.metricLabel()}>{stat.label}</Typography>
          </article>
        ))}
      </Card.Content>
    </Card>
  );
}
