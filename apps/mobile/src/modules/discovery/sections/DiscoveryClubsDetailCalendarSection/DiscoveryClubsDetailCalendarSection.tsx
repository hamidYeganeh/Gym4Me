"use client";

import { Button } from "@heroui/react/button";
import { Calendar } from "@heroui/react/calendar";
import { Drawer } from "@heroui/react/drawer";
import { Link } from "@heroui/react/link";
import { ScrollShadow } from "@heroui/react/scroll-shadow";
import { Skeleton } from "@heroui/react/skeleton";
import { Typography } from "@heroui/react/typography";
import type { DateValue } from "@internationalized/date";
import {
  GregorianCalendar,
  parseDate,
  toCalendar,
} from "@internationalized/date";
import { Calendar1 } from "@repo/icons/Calendar1";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { durationMs, ease, stagger, transition } from "@repo/theme";
import { ScheduleWorkoutCard } from "@repo/ui/cards/ScheduleWorkoutCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { I18nProvider } from "react-aria-components";
import type { ClubDetailOperatingHour } from "../../lib/club-detail-data";
import {
  addDaysIso,
  formatJalaliDay,
  formatJalaliRangeLabel,
  getDayItems,
  groupDayItemsByHour,
  todayIso,
  weekRangeContaining,
  weekdayKey,
  weekdaySat0,
  type ClubCalendarSlotIntensity,
} from "../../lib/club-calendar-data";
import { useDiscoveryClubCalendar } from "../../lib/use-discovery-club-calendar";
import { discoveryClubsDetailCalendarSectionStyles as styles } from "./DiscoveryClubsDetailCalendarSection.styles";
import type { DiscoveryClubsDetailCalendarSectionProps } from "./DiscoveryClubsDetailCalendarSection.types";

/** Day is closed when every operating-hours row for that weekday is closed. */
function isWeekdayClosed(
  hours: ClubDetailOperatingHour[],
  weekday: number,
): boolean {
  const rows = hours.filter((row) => row.weekday === weekday);
  if (rows.length === 0) return false;
  return rows.every((row) => row.status === "closed");
}

const INTENSITY_LABEL_KEYS = {
  intense: "calendarIntensityIntense",
  normal: "calendarIntensityNormal",
  extreme: "calendarIntensityExtreme",
} as const satisfies Record<
  ClubCalendarSlotIntensity,
  | "calendarIntensityIntense"
  | "calendarIntensityNormal"
  | "calendarIntensityExtreme"
>;

/** Months shown in the date-picker sheet (stacked vertically). */
const PICKER_MONTH_COUNT = 6;

const SKELETON_GROUP_COUNT = 3;
const SKELETON_CARDS_PER_GROUP = [2, 1, 2] as const;

const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: [...ease.outFluid] },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: [...ease.outFluid] },
  },
};

const slotVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...transition,
      delay: stagger.delayChildren + index * stagger.children,
    },
  }),
};

function dateValueToIso(value: DateValue): string {
  const gregorian = toCalendar(value, new GregorianCalendar());
  return [
    String(gregorian.year).padStart(4, "0"),
    String(gregorian.month).padStart(2, "0"),
    String(gregorian.day).padStart(2, "0"),
  ].join("-");
}

function TimelineSkeleton({ label }: { label: string }) {
  return (
    <div
      aria-busy="true"
      aria-label={label}
      className={styles.skeletonRoot()}
      role="status"
    >
      <span aria-hidden className={styles.timelineLine()} />
      {Array.from({ length: SKELETON_GROUP_COUNT }, (_, groupIndex) => (
        <div className={styles.skeletonGroup()} key={groupIndex}>
          <div className={styles.skeletonRail()}>
            <Skeleton className={styles.skeletonBadge()} />
          </div>
          <div className={styles.skeletonCards()}>
            {Array.from(
              { length: SKELETON_CARDS_PER_GROUP[groupIndex] ?? 1 },
              (_, cardIndex) => (
                <div className={styles.skeletonCard()} key={cardIndex}>
                  <Skeleton className={styles.skeletonThumb()} />
                  <div className={styles.skeletonLines()}>
                    <Skeleton
                      className={[styles.skeletonLine(), "w-[70%]"].join(" ")}
                    />
                    <Skeleton
                      className={[styles.skeletonLine(), "w-[48%]"].join(" ")}
                    />
                    <Skeleton
                      className={[styles.skeletonLine(), "w-[32%]"].join(" ")}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function DiscoveryClubsDetailCalendarSection({
  club,
  classId,
  coachId,
  title,
  seeAllHref,
}: DiscoveryClubsDetailCalendarSectionProps) {
  const t = useTranslations("ClubDetail");
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const today = useMemo(() => todayIso(), []);
  const [anchor, setAnchor] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isTimelineSwitching, setIsTimelineSwitching] = useState(false);
  const skipSwitchSkeleton = useRef(true);
  const slotsHref = seeAllHref ?? `/discovery/clubs/${club.id}/slots`;
  const sectionTitle = title ?? t("calendarTitle");

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

  useEffect(() => {
    const selectedDay = weekDays.find((day) => day.date === selectedDate);
    const selectedClosed =
      selectedDay != null &&
      isWeekdayClosed(club.operatingHours, selectedDay.weekday);
    if (!selectedClosed) return;
    const firstOpen = weekDays.find(
      (day) => !isWeekdayClosed(club.operatingHours, day.weekday),
    );
    if (firstOpen) setSelectedDate(firstOpen.date);
  }, [club.operatingHours, selectedDate, weekDays]);

  const selectedItems = useMemo(() => {
    const items = getDayItems(calendar, selectedDate);
    return items.filter((item) => {
      if (classId && item.classId !== classId) return false;
      if (coachId && item.coachId !== coachId) return false;
      return true;
    });
  }, [calendar, classId, coachId, selectedDate]);

  const hourGroups = useMemo(
    () => groupDayItemsByHour(selectedItems),
    [selectedItems],
  );

  useEffect(() => {
    if (skipSwitchSkeleton.current) {
      skipSwitchSkeleton.current = false;
      return;
    }
    setIsTimelineSwitching(true);
    const timer = window.setTimeout(() => {
      setIsTimelineSwitching(false);
    }, durationMs.moderate);
    return () => window.clearTimeout(timer);
  }, [selectedDate, range.from]);

  const showTimelineSkeleton = isLoading || isTimelineSwitching;

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
        <div className={styles.titleRow()}>
          <Calendar1 aria-hidden className={styles.titleIcon()} size={20} />
          <Typography className={styles.title()} type="h4" weight="semibold">
            {sectionTitle}
          </Typography>
        </div>
        <Link
          className={styles.seeAll()}
          onPress={() => router.push(slotsHref)}
        >
          {t("seeAllSlots")}
        </Link>
      </div>

      <div className={styles.nav()}>
        <Button
          aria-label={t("calendarPrevWeek")}
          isIconOnly
          onPress={() => goWeek(-1)}
          size="lg"
          variant="ghost"
        >
          <ChevronRight rtlMirror={false} size={18} />
        </Button>
        <div className={styles.rangeCluster()}>
          <Typography className={styles.range()}>
            {formatJalaliRangeLabel(range.from, range.to)}
          </Typography>
          <Button
            aria-label={t("calendarOpenPicker")}
            className={styles.pickerButton()}
            isIconOnly
            onPress={() => setIsPickerOpen(true)}
            size="lg"
            variant="ghost"
          >
            <Calendar1 size={18} />
          </Button>
        </div>
        <Button
          aria-label={t("calendarNextWeek")}
          isIconOnly
          onPress={() => goWeek(1)}
          size="lg"
          variant="ghost"
        >
          <ChevronLeft rtlMirror={false} size={18} />
        </Button>
      </div>

      <Drawer.Backdrop isOpen={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <Drawer.Content placement="bottom">
          <Drawer.Dialog>
            <Drawer.Handle />
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading>{t("calendarPickerTitle")}</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className={styles.pickerDrawerBody()}>
              <ScrollShadow
                className={styles.pickerDrawerScroll()}
                hideScrollBar
                orientation="vertical"
                size={56}
              >
                <I18nProvider locale="fa-IR">
                  <Calendar
                    aria-label={t("calendarPickerLabel")}
                    className={styles.pickerCalendar()}
                    onChange={(value) => {
                      if (!value) return;
                      const iso = dateValueToIso(value);
                      setSelectedDate(iso);
                      setAnchor(iso);
                      setIsPickerOpen(false);
                    }}
                    value={parseDate(selectedDate)}
                    visibleDuration={{ months: PICKER_MONTH_COUNT }}
                  >
                    <div className={styles.pickerMonths()}>
                      {Array.from(
                        { length: PICKER_MONTH_COUNT },
                        (_, index) => (
                          <div className={styles.pickerMonth()} key={index}>
                            <Calendar.Header
                              className={styles.pickerMonthHeader()}
                            >
                              <Calendar.Heading
                                className={styles.pickerHeading()}
                                offset={{ months: index }}
                              />
                            </Calendar.Header>
                            <Calendar.Grid offset={{ months: index }}>
                              <Calendar.GridHeader>
                                {(day) => (
                                  <Calendar.HeaderCell>
                                    {day}
                                  </Calendar.HeaderCell>
                                )}
                              </Calendar.GridHeader>
                              <Calendar.GridBody>
                                {(date) => <Calendar.Cell date={date} />}
                              </Calendar.GridBody>
                            </Calendar.Grid>
                          </div>
                        ),
                      )}
                    </div>
                  </Calendar>
                </I18nProvider>
              </ScrollShadow>
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>

      {isError ? (
        <div className={[styles.status(), styles.statusError()].join(" ")}>
          {t("calendarError")}
        </div>
      ) : null}

      <div
        aria-label={sectionTitle}
        className={styles.days()}
        role="listbox"
      >
        {weekDays.map((day) => {
          const selected = day.date === selectedDate;
          const closed = isWeekdayClosed(club.operatingHours, day.weekday);
          return (
            <Button
              aria-disabled={closed || undefined}
              aria-selected={selected && !closed}
              className={[
                styles.dayButton(),
                closed
                  ? styles.dayButtonClosed()
                  : selected
                    ? styles.dayButtonSelected()
                    : "",
              ]
                .filter(Boolean)
                .join(" ")}
              isDisabled={closed}
              key={day.date}
              variant="ghost"
              onPress={() => {
                if (closed) return;
                setSelectedDate(day.date);
              }}
            >
              <span
                className={[
                  styles.dayName(),
                  closed
                    ? styles.dayNameClosed()
                    : selected
                      ? styles.dayNameSelected()
                      : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {t(`calendarWeekday.${weekdayKey(day.weekday)}`)}
              </span>
              <span
                className={[
                  styles.dayNumber(),
                  closed
                    ? styles.dayNumberClosed()
                    : selected
                      ? styles.dayNumberSelected()
                      : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {formatJalaliDay(day.date)}
              </span>
              <span
                aria-hidden
                className={[
                  styles.dayDot(),
                  closed
                    ? styles.dayDotClosed()
                    : selected
                      ? styles.dayDotSelected()
                      : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            </Button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {showTimelineSkeleton ? (
          <motion.div
            animate="visible"
            exit="exit"
            initial={reduceMotion ? false : "hidden"}
            key={`skeleton-${selectedDate}-${range.from}`}
            variants={fadeVariants}
          >
            <TimelineSkeleton label={t("calendarLoading")} />
          </motion.div>
        ) : hourGroups.length === 0 ? (
          <motion.div
            animate="visible"
            className={styles.empty()}
            exit="exit"
            initial={reduceMotion ? false : "hidden"}
            key={`empty-${selectedDate}`}
            variants={fadeVariants}
          >
            {classId
              ? t("calendarEmptyClass")
              : coachId
                ? t("calendarEmptyCoach")
                : source === "mock"
                  ? t("calendarEmpty")
                  : t("calendarEmptyLive")}
          </motion.div>
        ) : (
          <motion.div
            animate="visible"
            className={styles.timeline()}
            exit="exit"
            initial={reduceMotion ? false : "hidden"}
            key={`timeline-${selectedDate}`}
            variants={fadeVariants}
          >
            <span aria-hidden className={styles.timelineLine()} />
            {hourGroups.map((group, groupIndex) => {
              const isLast = groupIndex === hourGroups.length - 1;
              const priorCount = hourGroups
                .slice(0, groupIndex)
                .reduce((sum, entry) => sum + 1 + entry.items.length, 0);
              return (
                <div className={styles.hourGroup()} key={group.hourKey}>
                  <div className={styles.rail()}>
                    <motion.span
                      className={styles.timeBadge()}
                      custom={priorCount}
                      variants={reduceMotion ? fadeVariants : slotVariants}
                    >
                      {group.label}
                    </motion.span>
                  </div>

                  <div
                    className={[
                      styles.cards(),
                      isLast ? styles.cardsLast() : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {group.items.map((item, itemIndex) => {
                      const href = `/discovery/clubs/${club.id}/slots/${item.slotId}`;
                      const cancelled = item.occurrenceStatus === "cancelled";
                      return (
                        <motion.div
                          className={[
                            styles.cardWrap(),
                            cancelled ? styles.cancelled() : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          custom={priorCount + 1 + itemIndex}
                          key={item.id}
                          variants={reduceMotion ? fadeVariants : slotVariants}
                        >
                          {cancelled ? (
                            <span className={styles.cancelledBadge()}>
                              {t("calendarCancelled")}
                            </span>
                          ) : null}
                          <ScheduleWorkoutCard
                            aria-label={item.title}
                            category={item.category}
                            duration={item.duration}
                            image={item.backgroundImage || PLACEHOLDER_IMAGE}
                            imageAlt={item.title}
                            intensity={item.intensity}
                            intensityLabel={t(
                              INTENSITY_LABEL_KEYS[item.intensity],
                            )}
                            onPress={() => {
                              router.push(href);
                            }}
                            title={item.title}
                            trailing="chevron"
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
