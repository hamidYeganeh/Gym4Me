"use client";

import { Button, Spinner, Typography } from "@heroui/react";
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
                    <Button
                      aria-label={removeSlotLabel}
                      className={styles.slotRemove()}
                      isIconOnly
                      size="lg"
                      variant="ghost"
                      onPress={() => void onRemoveSlot(slot.id)}
                    >
                      <CloseX size={14} />
                    </Button>
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
