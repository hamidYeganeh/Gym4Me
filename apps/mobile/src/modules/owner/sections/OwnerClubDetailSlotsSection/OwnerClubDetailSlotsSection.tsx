import { Typography } from "@heroui/react/typography";
import { ownerClubDetailSlotsSectionVariants } from "./OwnerClubDetailSlotsSection.styles";
import type { OwnerClubDetailSlotsSectionProps } from "./OwnerClubDetailSlotsSection.types";

export function OwnerClubDetailSlotsSection({
  title,
  hint,
  slotDays,
  className,
}: OwnerClubDetailSlotsSectionProps) {
  const styles = ownerClubDetailSlotsSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <div>
        <Typography className={styles.title()} type="h4" weight="semibold">
          {title}
        </Typography>
        <Typography className={styles.hint()} type="body-sm">
          {hint}
        </Typography>
      </div>
      <div className={styles.groupCard()}>
        {slotDays.map((day, index) => (
          <div key={day.id}>
            <div className={styles.row()}>
              <span className={styles.rowBody()}>
                <Typography
                  className={styles.rowLabel()}
                  type="body"
                  weight="medium"
                >
                  {day.dayLabel}
                </Typography>
                <Typography className={styles.hint()} type="body-sm">
                  {day.peakHoursLabel}
                </Typography>
              </span>
              <span className={styles.rowValue()}>{day.slotCountLabel}</span>
            </div>
            {index < slotDays.length - 1 ? (
              <div aria-hidden className={styles.divider()} />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
