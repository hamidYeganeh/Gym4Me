"use client";

import { Button, Typography } from "@heroui/react";
import { coachCalendarDailyDatePickerSectionStyles as styles } from "./CoachCalendarDailyDatePickerSection.styles";
import type { CoachCalendarDailyDatePickerSectionProps } from "./CoachCalendarDailyDatePickerSection.types";

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function toPersianDigits(value: number): string {
  return String(value).replace(
    /\d/g,
    (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit,
  );
}

export function CoachCalendarDailyDatePickerSection({
  days,
  selectedDayId,
  onSelectDay,
  dayLabels,
}: CoachCalendarDailyDatePickerSectionProps) {
  return (
    <div className={styles.root}>
      {days.map((day) => {
        const selected = day.id === selectedDayId;
        const dateLabel = toPersianDigits(day.date);

        return (
          <Button
            key={day.id}
            aria-label={`${dayLabels[day.dayKey]} ${dateLabel}`}
            aria-pressed={selected}
            className={styles.day}
            onPress={() => onSelectDay(day.id)}
            size="lg"
            variant={selected ? "primary" : "ghost"}
          >
            <Typography className={styles.dayLetter} type="body-xs">
              {dayLabels[day.dayKey]}
            </Typography>
            <Typography className={styles.dayNumber}>{dateLabel}</Typography>
            {day.hasWorkout && !selected ? (
              <span aria-hidden className={styles.dot} />
            ) : null}
          </Button>
        );
      })}
    </div>
  );
}
