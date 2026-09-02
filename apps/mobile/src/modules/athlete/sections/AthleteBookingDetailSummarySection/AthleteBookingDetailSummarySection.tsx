import { Chip } from "@heroui/react/chip";
import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { athleteBookingDetailSummarySectionVariants } from "./AthleteBookingDetailSummarySection.styles";
import type { AthleteBookingDetailSummarySectionProps } from "./AthleteBookingDetailSummarySection.types";

export function AthleteBookingDetailSummarySection({
  booking,
  statusLabel,
  statusColor,
  showCheckIn,
  detailRows,
  t,
  isApiBooking,
  router,
}: AthleteBookingDetailSummarySectionProps) {
  const styles = athleteBookingDetailSummarySectionVariants();

  if (!booking) return null;

  return (
    <>
      <section className={styles.hero()}>
        <Chip color={statusColor}>
          <Chip.Label>{statusLabel}</Chip.Label>
        </Chip>
        <Typography className={styles.heroTitle()} type="h1" weight="bold">
          {booking.title}
        </Typography>
        <Typography className={styles.heroClub()} type="body">
          {booking.clubName}
        </Typography>
      </section>

      <section className={styles.section()}>
        <Typography className={styles.sectionTitle()} type="body-sm">
          {t("detailsTitle")}
        </Typography>
        <div className={styles.detailsCard()}>
          {detailRows.map((row, index) => (
            <div key={row.key}>
              <div className={styles.detailRow()}>
                <Typography className={styles.detailLabel()} type="body-sm">
                  {row.label}
                </Typography>
                <Typography
                  className={styles.detailValue()}
                  type="body"
                  weight="medium"
                >
                  {row.value}
                </Typography>
              </div>
              {index < detailRows.length - 1 ? (
                <div aria-hidden className={styles.divider()} />
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {showCheckIn ? (
        <section className={styles.checkInCard()}>
          <Typography
            className={styles.checkInTitle()}
            type="h4"
            weight="semibold"
          >
            {t("checkInTitle")}
          </Typography>
          {isApiBooking ? (
            <Button
              onPress={() => router.push(`/athlete/qr-check-in?bookingId=${encodeURIComponent(booking.id)}`)}
              size="lg"
              variant="primary"
            >
              {t("openCheckInCode")}
            </Button>
          ) : (
            <span className={styles.checkInCode()}>{booking.checkInCode}</span>
          )}
          <Typography className={styles.checkInHint()} type="body-sm">
            {t("checkInHint")}
          </Typography>
        </section>
      ) : null}
    </>
  );
}
