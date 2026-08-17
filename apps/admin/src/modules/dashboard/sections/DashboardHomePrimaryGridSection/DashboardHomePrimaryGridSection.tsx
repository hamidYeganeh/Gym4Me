import { Button, Card, Typography } from "@heroui/react";
import { ArrowForward2 } from "@repo/icons";
import { AreaLineChart } from "@repo/ui/kit/AreaLineChart";
import { dashboardHomePrimaryGridSectionVariants } from "./DashboardHomePrimaryGridSection.styles";
import type { DashboardHomePrimaryGridSectionProps } from "./DashboardHomePrimaryGridSection.types";

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
            <AreaLineChart
              aria-label={chartAriaLabel}
              className={styles.chart()}
              color="var(--accent)"
              data={chartData}
            />
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
