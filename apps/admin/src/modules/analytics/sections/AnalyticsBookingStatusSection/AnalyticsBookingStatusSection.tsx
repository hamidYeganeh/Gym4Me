import { Card, Chip } from "@heroui/react";
import { useTranslations } from "next-intl";
import {
  BOOKING_STATUS_TONES,
  formatFaNumber,
} from "../../lib/analytics-data";
import { analyticsBookingStatusSectionVariants } from "./AnalyticsBookingStatusSection.styles";
import type { AnalyticsBookingStatusSectionProps } from "./AnalyticsBookingStatusSection.types";

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
        {rows.map((row) => (
          <div className={styles.row()} key={row.status}>
            <span className={styles.rowStart()}>
              <Chip
                color={BOOKING_STATUS_TONES[row.status]}
                size="sm"
                variant="soft"
              >
                {t(`statuses.${row.status}`)}
              </Chip>
            </span>
            <span className={styles.rowCount()}>
              {formatFaNumber(row.count)}
            </span>
          </div>
        ))}
      </Card.Content>
    </Card>
  );
}
