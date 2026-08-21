"use client";

import { Typography } from "@heroui/react/typography";
import { Cake } from "@repo/icons/Cake";
import {
  clampJalaliDay,
  jalaliDaysInMonth,
  ONBOARDING_YEAR_MAX,
  ONBOARDING_YEAR_MIN,
} from "@/modules/app/lib/onboarding-data";
import { JalaliCalendar } from "@/shared/components/JalaliCalendar";
import { onboardingBirthdateSectionVariants } from "./OnboardingBirthdateSection.styles";
import type {
  OnboardingBirthdateSectionProps,
  OnboardingBirthdateValue,
} from "./OnboardingBirthdateSection.types";

const MIN_BIRTHDATE: OnboardingBirthdateValue = {
  year: ONBOARDING_YEAR_MIN,
  month: 1,
  day: 1,
};

const MAX_BIRTHDATE: OnboardingBirthdateValue = {
  year: ONBOARDING_YEAR_MAX,
  month: 12,
  day: jalaliDaysInMonth(ONBOARDING_YEAR_MAX, 12),
};

export function OnboardingBirthdateSection({
  ageLabel,
  calendarAria,
  value,
  onChange,
  className,
}: OnboardingBirthdateSectionProps) {
  const styles = onboardingBirthdateSectionVariants();
  const calendarValue: OnboardingBirthdateValue = {
    year: value.year,
    month: value.month,
    day: clampJalaliDay(value.year, value.month, value.day),
  };

  return (
    <div className={styles.root({ className })} data-onboarding-nested-scroll>
      <JalaliCalendar
        aria-label={calendarAria}
        className={styles.calendar()}
        maxDate={MAX_BIRTHDATE}
        minDate={MIN_BIRTHDATE}
        value={calendarValue}
        onChange={(next) => {
          onChange({
            year: next.year,
            month: next.month,
            day: clampJalaliDay(next.year, next.month, next.day),
          });
        }}
      />

      <div className={styles.ageRow()}>
        <Cake aria-hidden className={styles.ageIcon()} size={20} />
        <Typography className={styles.age()}>{ageLabel}</Typography>
      </div>
    </div>
  );
}
