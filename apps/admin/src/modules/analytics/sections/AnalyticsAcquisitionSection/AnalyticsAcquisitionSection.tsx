import { Card } from "@heroui/react";
import { useTranslations } from "next-intl";
import {
  formatFaNumber,
  formatFaPercent,
} from "../../lib/analytics-data";
import { analyticsAcquisitionSectionVariants } from "./AnalyticsAcquisitionSection.styles";
import type { AnalyticsAcquisitionSectionProps } from "./AnalyticsAcquisitionSection.types";

export function AnalyticsAcquisitionSection({
  sources,
  className,
}: AnalyticsAcquisitionSectionProps) {
  const t = useTranslations("Admin.Analytics.acquisition");
  const styles = analyticsAcquisitionSectionVariants();

  const total = sources.reduce((sum, source) => sum + source.count, 0);
  const maxCount = Math.max(...sources.map((source) => source.count), 1);

  return (
    <Card className={styles.card({ className })}>
      <Card.Header className={styles.cardHeader()}>
        <Card.Title className={styles.cardTitle()}>{t("title")}</Card.Title>
        <Card.Description className={styles.cardDescription()}>
          {t("description")}
        </Card.Description>
      </Card.Header>
      <Card.Content className={styles.content()}>
        {sources.map((source) => {
          const share = total > 0 ? (source.count / total) * 100 : 0;
          return (
            <div className={styles.row()} key={source.id}>
              <div className={styles.rowTop()}>
                <span className={styles.rowLabel()}>
                  {t(`sources.${source.id}`)}
                </span>
                <span className={styles.rowNumbers()}>
                  <span className={styles.rowCount()}>
                    {formatFaNumber(source.count)}
                  </span>
                  <span className={styles.rowShare()}>
                    {formatFaPercent(share)}
                  </span>
                </span>
              </div>
              <div
                aria-label={`${t(`sources.${source.id}`)}: ${formatFaPercent(share)}`}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={Math.round(share)}
                className={styles.track()}
                role="meter"
              >
                <span
                  className={styles.fill()}
                  style={{ width: `${(source.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </Card.Content>
    </Card>
  );
}
