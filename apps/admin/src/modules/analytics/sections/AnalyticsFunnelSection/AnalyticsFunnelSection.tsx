import { Card } from "@heroui/react/card";
import { FunnelChart } from "@repo/ui/kit/FunnelChart";
import { useTranslations } from "next-intl";
import { formatFaNumber, formatFaPercent } from "../../lib/analytics-data";
import { analyticsFunnelSectionVariants } from "./AnalyticsFunnelSection.styles";
import type { AnalyticsFunnelSectionProps } from "./AnalyticsFunnelSection.types";

export function AnalyticsFunnelSection({
  steps,
  className,
}: AnalyticsFunnelSectionProps) {
  const t = useTranslations("Admin.Analytics.funnel");
  const styles = analyticsFunnelSectionVariants();

  return (
    <Card className={styles.card({ className })}>
      <Card.Header className={styles.cardHeader()}>
        <Card.Title className={styles.cardTitle()}>{t("title")}</Card.Title>
        <Card.Description className={styles.cardDescription()}>
          {t("description")}
        </Card.Description>
      </Card.Header>
      <Card.Content className={styles.content()}>
        <FunnelChart
          aria-label={t("title")}
          color="var(--chart-2)"
          data={steps.map((step) => ({
            label: t(`steps.${step.id}`),
            value: step.count,
          }))}
          formatPercentage={(pct) => formatFaPercent(pct)}
          formatValue={(value) => formatFaNumber(value)}
        />
      </Card.Content>
    </Card>
  );
}
