import { lazy, Suspense } from "react";
import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { ArrowForward2 } from "@repo/icons/ArrowForward2";
import { dashboardHomePrimaryGridSectionVariants } from "./DashboardHomePrimaryGridSection.styles";
import type { DashboardHomePrimaryGridSectionProps } from "./DashboardHomePrimaryGridSection.types";

const AreaLineChart = lazy(() =>
  import("@repo/ui/kit/AreaLineChart").then((mod) => ({
    default: mod.AreaLineChart,
  })),
);

export function DashboardHomePrimaryGridSection({
  revenueTitle,
  revenueDescription,
  revenueTotal,
  revenueUnit,
  chartData,
  chartAriaLabel,
  revenueEmptyLabel,
  queueTitle,
  queueDescription,
  queueTotal,
  queueItems,
  queueActionLabel,
  onQueueAction,
  className,
}: DashboardHomePrimaryGridSectionProps) {
  const styles = dashboardHomePrimaryGridSectionVariants();

  return (
    <div className={styles.primaryGrid({ className })}>
      <Card className={styles.revenueCard()}>
        <Card.Header className={styles.cardHeader()}>
          <div>
            <Card.Title className={styles.cardTitle()}>{revenueTitle}</Card.Title>
            <Card.Description className={styles.cardDescription()}>
              {revenueDescription}
            </Card.Description>
          </div>
          <div className={styles.revenueTotal()}>
            <span className={styles.revenueValue()}>{revenueTotal}</span>
            <span className={styles.revenueUnit()}>{revenueUnit}</span>
          </div>
        </Card.Header>
        <Card.Content className={styles.chartContent()}>
          {chartData.length > 0 ? (
            <Suspense
              fallback={
                <div className={styles.chartFallback()}>
                  <Spinner size="lg" />
                </div>
              }
            >
              <AreaLineChart
                aria-label={chartAriaLabel}
                className={styles.chart()}
                color="var(--accent)"
                data={chartData}
              />
            </Suspense>
          ) : (
            <Typography className={styles.cardDescription()}>
              {revenueEmptyLabel}
            </Typography>
          )}
        </Card.Content>
      </Card>

      <Card className={styles.queueCard()}>
        <Card.Header className={styles.cardHeader()}>
          <div>
            <Card.Title className={styles.cardTitle()}>{queueTitle}</Card.Title>
            <Card.Description className={styles.cardDescription()}>
              {queueDescription}
            </Card.Description>
          </div>
          <span className={styles.queueTotal()}>{queueTotal}</span>
        </Card.Header>
        <Card.Content className={styles.queueContent()}>
          {queueItems.map((item) => (
            <div className={styles.queueItem()} key={item.title}>
              <span className={styles.queueIcon({ tone: item.tone })}>
                {item.icon}
              </span>
              <div className={styles.queueCopy()}>
                <span className={styles.queueTitle()}>{item.title}</span>
                <span className={styles.queueDescription()}>
                  {item.description}
                </span>
              </div>
              <span className={styles.queueCount()}>{item.count}</span>
            </div>
          ))}
        </Card.Content>
        <Card.Footer className={styles.cardFooter()}>
          <Button fullWidth variant="secondary" onPress={onQueueAction}>
            {queueActionLabel}
            <ArrowForward2 size={17} />
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
}
