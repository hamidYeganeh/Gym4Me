import { Card } from "@heroui/react";
import { DonutChart } from "@repo/ui/kit/DonutChart";
import { useTranslations } from "next-intl";
import {
  BOOKING_STATUS_TONES,
  formatFaNumber,
} from "../../lib/analytics-data";
import { analyticsBookingStatusSectionVariants } from "./AnalyticsBookingStatusSection.styles";
import type { AnalyticsBookingStatusSectionProps } from "./AnalyticsBookingStatusSection.types";

const TONE_COLORS: Record<string, string> = {
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  default: "var(--muted)",
};

export function AnalyticsBookingStatusSection({
  rows,
  className,
}: AnalyticsBookingStatusSectionProps) {
  const t = useTranslations("Admin.Analytics.bookingStatus");
  const styles = analyticsBookingStatusSectionVariants();

  return (
    <Card className={styles.card({ className })}>
      <Card.Header className={styles.cardHeader()}>
        <Card.Title className={styles.cardTitle()}>{t("title")}</Card.Title>
        <Card.Description className={styles.cardDescription()}>
          {t("description")}
        </Card.Description>
      </Card.Header>
      <Card.Content className={styles.content()}>
        <DonutChart
          aria-label={t("title")}
          data={rows.map((row) => ({
            id: row.status,
            label: t(`statuses.${row.status}`),
            value: row.count,
            color: TONE_COLORS[BOOKING_STATUS_TONES[row.status]],
          }))}
          formatValue={(value) => formatFaNumber(value)}
        />
      </Card.Content>
    </Card>
  );
}
