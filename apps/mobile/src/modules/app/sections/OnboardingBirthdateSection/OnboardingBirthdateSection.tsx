"use client";

import { Calendar } from "@heroui/react/calendar";
import { Typography } from "@heroui/react/typography";
import { Cake } from "@repo/icons/Cake";
import {
  CalendarDate,
  type DateValue,
} from "@internationalized/date";
import { I18nProvider } from "react-aria-components";
import {
  ONBOARDING_YEAR_MAX,
  ONBOARDING_YEAR_MIN,
} from "@/modules/app/lib/onboarding-data";
import { toGregorian, toJalali } from "@/shared/lib/jalali";
import { onboardingBirthdateSectionVariants } from "./OnboardingBirthdateSection.styles";
import type {
  OnboardingBirthdateSectionProps,
  OnboardingBirthdateValue,
} from "./OnboardingBirthdateSection.types";

/** Store Jalali in form state; HeroUI Calendar value stays Gregorian. */
function toGregorianValue(value: OnboardingBirthdateValue): CalendarDate {
  const { gy, gm, gd } = toGregorian(value.year, value.month, value.day);
  return new CalendarDate(gy, gm, gd);
}

function fromGregorianValue(value: DateValue): OnboardingBirthdateValue {
  const { jy, jm, jd } = toJalali(value.year, value.month, value.day);
  return { year: jy, month: jm, day: jd };
}

function jalaliBoundsToGregorian(
  year: number,
  month: number,
  day: number,
): CalendarDate {
  const { gy, gm, gd } = toGregorian(year, month, day);
  return new CalendarDate(gy, gm, gd);
}

export function OnboardingBirthdateSection({
  ageLabel,
  calendarAria,
  value,
  onChange,
  className,
}: OnboardingBirthdateSectionProps) {
  const styles = onboardingBirthdateSectionVariants();
  const calendarValue = toGregorianValue(value);
  const minValue = jalaliBoundsToGregorian(ONBOARDING_YEAR_MIN, 1, 1);
  const maxValue = jalaliBoundsToGregorian(ONBOARDING_YEAR_MAX, 12, 29);

  return (
    <div className={styles.root({ className })} data-onboarding-nested-scroll>
      <I18nProvider locale="fa-IR-u-ca-persian">
        <Calendar
          aria-label={calendarAria}
          className={styles.calendar()}
          firstDayOfWeek="sat"
          maxValue={maxValue}
          minValue={minValue}
          value={calendarValue}
          onChange={(next) => {
            if (!next) return;
            onChange(fromGregorianValue(next));
          }}
        >
          <Calendar.Header className={styles.header()}>
            <Calendar.YearPickerTrigger>
              <Calendar.YearPickerTriggerHeading className={styles.heading()} />
              <Calendar.YearPickerTriggerIndicator />
            </Calendar.YearPickerTrigger>
            <Calendar.NavButton
              className={styles.navButton()}
              slot="previous"
            />
            <Calendar.NavButton className={styles.navButton()} slot="next" />
          </Calendar.Header>

          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => (
                <Calendar.HeaderCell className={styles.headerCell()}>
                  {day}
                </Calendar.HeaderCell>
              )}
            </Calendar.GridHeader>
            <Calendar.GridBody>
              {(date) => (
                <Calendar.Cell className={styles.cell()} date={date} />
              )}
            </Calendar.GridBody>
          </Calendar.Grid>

          <Calendar.YearPickerGrid>
            <Calendar.YearPickerGridBody>
              {({ year }) => <Calendar.YearPickerCell year={year} />}
            </Calendar.YearPickerGridBody>
          </Calendar.YearPickerGrid>
        </Calendar>
      </I18nProvider>

      <div className={styles.ageRow()}>
        <Cake aria-hidden className={styles.ageIcon()} size={20} />
        <Typography className={styles.age()}>{ageLabel}</Typography>
      </div>
    </div>
  );
}
