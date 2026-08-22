"use client";

import { Calendar } from "@heroui/react/calendar";
import type { CalendarDate } from "@internationalized/date";
import { I18nProvider } from "react-aria-components";
import {
  calendarDateToJalaliValue,
  JALALI_CALENDAR_LOCALE,
  jalaliValueToIso,
  toJalaliCalendarDate,
} from "./jalali-calendar-utils";
import { jalaliCalendarVariants } from "./JalaliCalendar.styles";
import type { JalaliCalendarProps } from "./JalaliCalendar.types";

export { jalaliValueToIso } from "./jalali-calendar-utils";

function JalaliCalendarGrid({
  monthOffset = 0,
  showWeekHeader = true,
}: {
  monthOffset?: number;
  showWeekHeader?: boolean;
}) {
  if (showWeekHeader) {
    return (
      <Calendar.Grid offset={{ months: monthOffset }}>
        <Calendar.GridHeader>
          {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
        </Calendar.GridHeader>
        <Calendar.GridBody>
          {(date) => <Calendar.Cell date={date} />}
        </Calendar.GridBody>
      </Calendar.Grid>
    );
  }

  return (
    <Calendar.Grid offset={{ months: monthOffset }}>
      <Calendar.GridBody>
        {(date) => <Calendar.Cell date={date} />}
      </Calendar.GridBody>
    </Calendar.Grid>
  );
}

export function JalaliCalendar({
  "aria-label": ariaLabel,
  value,
  onChange,
  minDate,
  maxDate,
  numberOfMonths = 1,
  buttons = true,
  className,
  calendarClassName,
}: JalaliCalendarProps) {
  const styles = jalaliCalendarVariants();
  const calendarValue = toJalaliCalendarDate(value);
  const minCalendarDate = toJalaliCalendarDate(minDate);
  const maxCalendarDate = toJalaliCalendarDate(maxDate);
  const showNav = buttons !== false;
  const monthCount = Math.max(1, numberOfMonths);

  return (
    <div
      aria-label={ariaLabel}
      className={styles.root({ className })}
      role="group"
    >
      <I18nProvider locale={JALALI_CALENDAR_LOCALE}>
        <Calendar
          aria-label={ariaLabel}
          className={styles.calendar({ className: calendarClassName })}
          firstDayOfWeek="sat"
          maxValue={maxCalendarDate}
          minValue={minCalendarDate}
          value={calendarValue}
          onChange={(next) => {
            if (!next) return;
            const jalali = calendarDateToJalaliValue(next as CalendarDate);
            onChange?.(jalali, next as CalendarDate);
          }}
        >
          {monthCount === 1 ? (
            <>
              <Calendar.Header>
                {showNav ? (
                  <Calendar.NavButton slot="previous" />
                ) : (
                  <span aria-hidden className={styles.navSpacer()} />
                )}
                <Calendar.YearPickerTrigger>
                  <Calendar.YearPickerTriggerHeading />
                  <Calendar.YearPickerTriggerIndicator />
                </Calendar.YearPickerTrigger>
                {showNav ? (
                  <Calendar.NavButton slot="next" />
                ) : (
                  <span aria-hidden className={styles.navSpacer()} />
                )}
              </Calendar.Header>
              <JalaliCalendarGrid />
              <Calendar.YearPickerGrid>
                <Calendar.YearPickerGridBody>
                  {({ year }) => <Calendar.YearPickerCell year={year} />}
                </Calendar.YearPickerGridBody>
              </Calendar.YearPickerGrid>
            </>
          ) : (
            <div className={styles.monthsStack()}>
              {Array.from({ length: monthCount }, (_, index) => (
                <div className={styles.monthBlock()} key={index}>
                  <Calendar.Header className={styles.monthHeader()}>
                    {showNav && index === 0 ? (
                      <Calendar.NavButton slot="previous" />
                    ) : (
                      <span aria-hidden className={styles.navSpacer()} />
                    )}
                    <Calendar.Heading
                      className={styles.monthHeading()}
                      offset={{ months: index }}
                    />
                    {showNav && index === monthCount - 1 ? (
                      <Calendar.NavButton slot="next" />
                    ) : (
                      <span aria-hidden className={styles.navSpacer()} />
                    )}
                  </Calendar.Header>
                  <JalaliCalendarGrid
                    monthOffset={index}
                    showWeekHeader={index === 0}
                  />
                </div>
              ))}
            </div>
          )}
        </Calendar>
      </I18nProvider>
    </div>
  );
}

export {
  calendarDateToJalaliValue,
  jalaliValueToCalendarDate,
  toJalaliCalendarDate,
} from "./jalali-calendar-utils";
