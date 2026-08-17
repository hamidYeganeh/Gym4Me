"use client";

import { Spinner, Typography } from "@heroui/react";
import { CloseX } from "@repo/icons/CloseX";
import { coachSlotsManageDaysSectionVariants } from "./CoachSlotsManageDaysSection.styles";
import type { CoachSlotsManageDaysSectionProps } from "./CoachSlotsManageDaysSection.types";

export function CoachSlotsManageDaysSection({
  days,
  loading = false,
  emptyDayLabel,
  removeSlotLabel,
  formatSlotTime,
  onRemoveSlot,
  className,
}: CoachSlotsManageDaysSectionProps) {
  const styles = coachSlotsManageDaysSectionVariants();

  if (loading) {
    return (
      <div className={styles.loading({ className })}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className={styles.days({ className })}>
      {days.map((day) => (
        <div className={styles.day()} key={day.date}>
          <Typography className={styles.dayLabel()} weight="bold">
            {day.label}
          </Typography>
          {day.slots.length > 0 ? (
            <div className={styles.slotsRow()}>
              {day.slots.map((slot) => (
                <span
                  className={`${styles.slotChip()} ${
                    slot.status === "open"
                      ? styles.slotOpen()
                      : slot.status === "booked"
                        ? styles.slotBooked()
                        : styles.slotBlocked()
                  }`}
                  key={slot.id}
                >
                  {formatSlotTime(slot.startsAt)}
                  {slot.club ? ` — ${slot.club.name}` : ""}
                  {slot.status === "open" ? (
                    <button
                      aria-label={removeSlotLabel}
                      className={styles.slotRemove()}
                      onClick={() => void onRemoveSlot(slot.id)}
                      type="button"
                    >
                      <CloseX size={14} />
                    </button>
                  ) : null}
                </span>
              ))}
            </div>
          ) : (
            <Typography className={styles.emptyDay()} type="body-sm">
              {emptyDayLabel}
            </Typography>
          )}
        </div>
      ))}
    </div>
  );
}
