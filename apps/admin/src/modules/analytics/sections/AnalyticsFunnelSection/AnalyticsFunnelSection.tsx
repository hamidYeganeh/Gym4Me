import { Card } from "@heroui/react/card";
import { HorizontalBarChart } from "@repo/ui/kit/HorizontalBarChart";
import { useTranslations } from "next-intl";
import { formatFaNumber } from "../../lib/analytics-data";
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
        <HorizontalBarChart
          aria-label={t("title")}
          color="var(--stats-blue)"
          data={steps.map((step) => ({
            id: step.id,
            label: t(`steps.${step.id}`),
            value: step.count,
          }))}
          formatValue={(value) => formatFaNumber(value)}
        />
      </Card.Content>
    </Card>
  );
}
