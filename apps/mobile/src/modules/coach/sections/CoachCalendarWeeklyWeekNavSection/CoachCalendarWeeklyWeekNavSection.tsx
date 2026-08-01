"use client";

import { Button, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { coachCalendarWeeklyWeekNavSectionStyles as styles } from "./CoachCalendarWeeklyWeekNavSection.styles";
import type { CoachCalendarWeeklyWeekNavSectionProps } from "./CoachCalendarWeeklyWeekNavSection.types";

export function CoachCalendarWeeklyWeekNavSection({
  rangeLabel,
  previousLabel,
  nextLabel,
  onPreviousWeek,
  onNextWeek,
  isPreviousDisabled = false,
  isNextDisabled = false,
}: CoachCalendarWeeklyWeekNavSectionProps) {
  return (
    <div className={styles.root}>
      <Button
        aria-label={previousLabel}
        isDisabled={isPreviousDisabled}
        isIconOnly
        onPress={onPreviousWeek}
        size="lg"
        variant="ghost"
      >
        <ChevronLeft size={18} />
      </Button>

      <Typography className={styles.range}>{rangeLabel}</Typography>

      <Button
        aria-label={nextLabel}
        isDisabled={isNextDisabled}
        isIconOnly
        onPress={onNextWeek}
        size="lg"
        variant="ghost"
      >
        <ChevronRight size={18} />
      </Button>
    </div>
  );
}
