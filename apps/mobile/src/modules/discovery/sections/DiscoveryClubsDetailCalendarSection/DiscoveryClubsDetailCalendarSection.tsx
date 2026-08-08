"use client";

import { Button, Spinner, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { ScheduleWorkoutCard } from "@repo/ui/cards/ScheduleWorkoutCard";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  addDaysIso,
  formatJalaliDay,
  formatJalaliRangeLabel,
  getDayItems,
  todayIso,
  weekRangeContaining,
  weekdayKey,
  weekdaySat0,
} from "../../lib/club-calendar-data";
import { useDiscoveryClubCalendar } from "../../lib/use-discovery-club-calendar";
import { discoveryClubsDetailCalendarSectionStyles as styles } from "./DiscoveryClubsDetailCalendarSection.styles";
import type { DiscoveryClubsDetailCalendarSectionProps } from "./DiscoveryClubsDetailCalendarSection.types";

export function DiscoveryClubsDetailCalendarSection({
  club,
}: DiscoveryClubsDetailCalendarSectionProps) {
  const t = useTranslations("ClubDetail");
  const router = useRouter();
  const today = useMemo(() => todayIso(), []);
  const [anchor, setAnchor] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);

  const range = useMemo(() => weekRangeContaining(anchor), [anchor]);
  const {
    data: calendar,
    isLoading,
    isError,
    source,
  } = useDiscoveryClubCalendar(club.id, range);

  const weekDays = useMemo(() => {
    if (calendar?.days?.length) return calendar.days;
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDaysIso(range.from, index);
      return {
        date,
        weekday: weekdaySat0(date),
        items: [],
      };
    });
  }, [calendar?.days, range.from]);

  const selectedItems = useMemo(
    () => getDayItems(calendar, selectedDate),
    [calendar, selectedDate],
  );

  const goWeek = (delta: number) => {
    const nextAnchor = addDaysIso(range.from, delta * 7);
    setAnchor(nextAnchor);
    const nextRange = weekRangeContaining(nextAnchor);
    if (selectedDate < nextRange.from || selectedDate > nextRange.to) {
      setSelectedDate(nextRange.from);
    }
  };

  return (
    <div className={styles.root()}>
      <div className={styles.header()}>
        <Typography className={styles.title()} type="h4" weight="semibold">
          {t("calendarTitle")}
        </Typography>
      </div>

      <div className={styles.nav()}>
        <Button
          aria-label={t("calendarPrevWeek")}
          isIconOnly
          onPress={() => goWeek(-1)}
          size="lg"
          variant="ghost"
        >
          <ChevronRight size={18} />
        </Button>
        <Typography className={styles.range()}>
          {formatJalaliRangeLabel(range.from, range.to)}
        </Typography>
        <Button
          aria-label={t("calendarNextWeek")}
          isIconOnly
          onPress={() => goWeek(1)}
          size="lg"
          variant="ghost"
        >
          <ChevronLeft size={18} />
        </Button>
      </div>

      {isLoading ? (
        <div className={styles.status()}>
          <Spinner size="sm" />
          <span className="ms-2">{t("calendarLoading")}</span>
        </div>
      ) : null}

      {isError ? (
        <div className={[styles.status(), styles.statusError()].join(" ")}>
          {t("calendarError")}
        </div>
      ) : null}

      {!isLoading ? (
        <div
          aria-label={t("calendarTitle")}
          className={styles.days()}
          role="listbox"
        >
          {weekDays.map((day) => {
            const selected = day.date === selectedDate;
            const isToday = day.date === today;
            const hasItems = day.items.some(
              (item) => item.occurrenceStatus === "scheduled",
            );
            return (
              <button
                aria-selected={selected}
                className={[
                  styles.dayButton(),
                  selected ? styles.dayButtonSelected() : "",
                  !selected && hasItems ? styles.dayButtonHasItems() : "",
                  !selected && isToday ? styles.dayButtonToday() : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                role="option"
                type="button"
              >
                <span
                  className={[
                    styles.dayName(),
                    selected ? styles.dayNameSelected() : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {t(`calendarWeekday.${weekdayKey(day.weekday)}`)}
                </span>
                <span
                  className={[
                    styles.dayNumber(),
                    selected ? styles.dayNumberSelected() : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {formatJalaliDay(day.date)}
                </span>
                {hasItems ? (
                  <span
                    aria-hidden
                    className={[
                      styles.dayDot(),
                      selected ? styles.dayDotSelected() : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {!isLoading && selectedItems.length === 0 ? (
        <div className={styles.empty()}>
          {source === "mock" ? t("calendarEmpty") : t("calendarEmptyLive")}
        </div>
      ) : null}

      {!isLoading && selectedItems.length > 0 ? (
        <div className={styles.list()}>
          {selectedItems.map((item) => {
            const href = item.classId
              ? `/discovery/clubs/${club.id}/classes/${item.classId}`
              : undefined;
            const cancelled = item.occurrenceStatus === "cancelled";
            return (
              <div
                className={[
                  styles.item(),
                  cancelled ? styles.cancelled() : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={item.id}
              >
                <div className={styles.timeRow()}>
                  <Typography className={styles.time()} type="body-xs">
                    {item.startTime} – {item.endTime}
                  </Typography>
                  {cancelled ? (
                    <span className={styles.cancelledBadge()}>
                      {t("calendarCancelled")}
                    </span>
                  ) : null}
                </div>
                <ScheduleWorkoutCard
                  aria-label={item.title}
                  category={item.category}
                  duration={item.duration}
                  onPress={
                    href
                      ? () => {
                          router.push(href);
                        }
                      : undefined
                  }
                  title={item.title}
                  trailing="chevron"
                />
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
