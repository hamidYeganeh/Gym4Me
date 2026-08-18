import { Fragment } from "react";
import { Card } from "@heroui/react/card";
import { useTranslations } from "next-intl";
import {
  formatFaNumber,
  formatFaPercent,
} from "../../lib/analytics-data";
import { analyticsRetentionSectionVariants } from "./AnalyticsRetentionSection.styles";
import type { AnalyticsRetentionSectionProps } from "./AnalyticsRetentionSection.types";

const PERIOD_COUNT = 6;
const LEGEND_STOPS = [15, 35, 55, 75, 95];

function cellBackground(value: number): string {
  return `color-mix(in oklab, var(--accent) ${Math.round(value)}%, transparent)`;
}

export function AnalyticsRetentionSection({
  cohorts,
  className,
}: AnalyticsRetentionSectionProps) {
  const t = useTranslations("Admin.Analytics.retention");
  const styles = analyticsRetentionSectionVariants();

  return (
    <Card className={styles.card({ className })}>
      <Card.Header className={styles.cardHeader()}>
        <Card.Title className={styles.cardTitle()}>{t("title")}</Card.Title>
        <Card.Description className={styles.cardDescription()}>
          {t("description")}
        </Card.Description>
      </Card.Header>
      <Card.Content className={styles.content()}>
        <div aria-label={t("gridAriaLabel")} className={styles.grid()} role="img">
          <span aria-hidden className={styles.headerCell()} />
          {Array.from({ length: PERIOD_COUNT }, (_, index) => (
            <span className={styles.headerCell()} key={`period-${index}`}>
              {`${t("periodLabel")} ${formatFaNumber(index)}`}
            </span>
          ))}

          {cohorts.map((cohort) => (
            <Fragment key={cohort.index}>
              <span className={styles.cohortLabel()}>
                {`${t("cohortLabel")} ${formatFaNumber(cohort.index)}`}
              </span>
              {Array.from({ length: PERIOD_COUNT }, (_, periodIndex) => {
                const value = cohort.values[periodIndex] ?? null;
                if (value === null) {
                  return (
                    <span
                      className={styles.emptyCell()}
                      key={`cell-${cohort.index}-${periodIndex}`}
                    />
                  );
                }
                return (
                  <span
                    className={styles.cell()}
                    key={`cell-${cohort.index}-${periodIndex}`}
                    style={{ backgroundColor: cellBackground(value) }}
                    title={formatFaPercent(value)}
                  >
                    {formatFaPercent(value)}
                  </span>
                );
              })}
            </Fragment>
          ))}
        </div>

        <div className={styles.legend()}>
          <span>{t("legendLow")}</span>
          <span aria-hidden className={styles.legendSwatches()}>
            {LEGEND_STOPS.map((stop) => (
              <span
                className={styles.legendSwatch()}
                key={stop}
                style={{ backgroundColor: cellBackground(stop) }}
              />
            ))}
          </span>
          <span>{t("legendHigh")}</span>
        </div>
      </Card.Content>
    </Card>
  );
}
