import { Card } from "@heroui/react/card";
import { HorizontalBarChart } from "@repo/ui/kit/HorizontalBarChart";
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

  return (
    <Card className={styles.card({ className })}>
      <Card.Header className={styles.cardHeader()}>
        <Card.Title className={styles.cardTitle()}>{t("title")}</Card.Title>
        <Card.Description className={styles.cardDescription()}>
          {t("description")}
        </Card.Description>
      </Card.Header>
      <Card.Content className={styles.content()}>
        <HorizontalBarChart
          aria-label={t("title")}
          data={sources.map((source) => ({
            id: source.id,
            label: t(`sources.${source.id}`),
            value: source.count,
          }))}
          formatValue={(value) =>
            `${formatFaNumber(value)} (${formatFaPercent(total > 0 ? (value / total) * 100 : 0)})`
          }
        />
      </Card.Content>
    </Card>
  );
}
