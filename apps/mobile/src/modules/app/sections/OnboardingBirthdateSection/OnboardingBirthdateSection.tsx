"use client";

import { Calendar } from "@heroui/react/calendar";
import { Typography } from "@heroui/react/typography";
import { Cake } from "@repo/icons/Cake";
import {
  CalendarDate,
  createCalendar,
  type DateValue,
} from "@internationalized/date";
import { I18nProvider } from "react-aria-components";
import {
  clampJalaliDay,
  jalaliDaysInMonth,
  ONBOARDING_YEAR_MAX,
  ONBOARDING_YEAR_MIN,
} from "@/modules/app/lib/onboarding-data";
import { toJalali } from "@/shared/lib/jalali";
import { onboardingBirthdateSectionVariants } from "./OnboardingBirthdateSection.styles";
import type {
  OnboardingBirthdateSectionProps,
  OnboardingBirthdateValue,
} from "./OnboardingBirthdateSection.types";

const PERSIAN_CALENDAR = createCalendar("persian");
const PERSIAN_LOCALE = "fa-IR-u-ca-persian";
const MIN_BIRTHDATE = new CalendarDate(PERSIAN_CALENDAR, ONBOARDING_YEAR_MIN, 1, 1);
const MAX_BIRTHDATE = new CalendarDate(
  PERSIAN_CALENDAR,
  ONBOARDING_YEAR_MAX,
  12,
  jalaliDaysInMonth(ONBOARDING_YEAR_MAX, 12),
);

/** Keep CalendarDate in the Persian calendar so year-picker min/max stay Jalali. */
function toPersianValue(value: OnboardingBirthdateValue): CalendarDate {
  return new CalendarDate(
    PERSIAN_CALENDAR,
    value.year,
    value.month,
    clampJalaliDay(value.year, value.month, value.day),
  );
}

function fromCalendarValue(value: DateValue): OnboardingBirthdateValue {
  if (value.calendar.identifier === "persian") {
    return { year: value.year, month: value.month, day: value.day };
  }
  const { jy, jm, jd } = toJalali(value.year, value.month, value.day);
  return { year: jy, month: jm, day: jd };
}

export function OnboardingBirthdateSection({
  ageLabel,
  calendarAria,
  value,
  onChange,
  className,
}: OnboardingBirthdateSectionProps) {
  const styles = onboardingBirthdateSectionVariants();
  const calendarValue = toPersianValue(value);

  return (
    <div className={styles.root({ className })} data-onboarding-nested-scroll>
      <I18nProvider locale={PERSIAN_LOCALE}>
        <Calendar
          aria-label={calendarAria}
          className={styles.calendar()}
          firstDayOfWeek="sat"
          maxValue={MAX_BIRTHDATE}
          minValue={MIN_BIRTHDATE}
          value={calendarValue}
          onChange={(next) => {
            if (!next) return;
            onChange(fromCalendarValue(next));
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
