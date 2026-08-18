"use client";

import { Button } from "@heroui/react/button";
import { ScrollShadow } from "@heroui/react/scroll-shadow";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { useTranslations } from "next-intl";
import {
  formatJalaliDateShort,
  weekdayKey,
  weekdaySat0,
} from "../../lib/club-calendar-data";
import { discoveryCoachesSlotsScheduleSectionVariants } from "./DiscoveryCoachesSlotsScheduleSection.styles";
import type { DiscoveryCoachesSlotsScheduleSectionProps } from "./DiscoveryCoachesSlotsScheduleSection.types";

export function DiscoveryCoachesSlotsScheduleSection({
  days,
  weekLabel,
  today,
  selectedSlotId,
  onPrevWeek,
  onNextWeek,
  onSlotPress,
  className,
}: DiscoveryCoachesSlotsScheduleSectionProps) {
  const t = useTranslations("CoachDetail");
  const styles = discoveryCoachesSlotsScheduleSectionVariants();

  const dayLabel = (date: string) => {
    const dateLabel = formatJalaliDateShort(date);
    if (date !== today) return dateLabel;
    const weekday = t(`slotsWeekday.${weekdayKey(weekdaySat0(date))}`);
    return t("slotsDayToday", { weekday, date: dateLabel });
  };

  return (
    <div className={styles.root({ className })}>
      <div className={styles.weekRow()}>
        <Typography className={styles.weekLabel()} weight="bold">
          {weekLabel}
        </Typography>
        <div className={styles.weekNav()}>
          <Button
            aria-label={t("slotsPrevWeek")}
            className={styles.weekButton()}
            isIconOnly
            onPress={onPrevWeek}
            size="lg"
          >
            <ChevronRight
              aria-hidden
              className={styles.weekButtonIcon()}
              rtlMirror={false}
              size={18}
            />
          </Button>
          <Button
            aria-label={t("slotsNextWeek")}
            className={styles.weekButton()}
            isIconOnly
            onPress={onNextWeek}
            size="lg"
          >
            <ChevronLeft
              aria-hidden
              className={styles.weekButtonIcon()}
              rtlMirror={false}
              size={18}
            />
          </Button>
        </div>
      </div>

      <div className={styles.days()}>
        {days.map((day) => (
          <div className={styles.day()} key={day.id}>
            <Typography className={styles.dayLabel()} weight="bold">
              {dayLabel(day.date)}
            </Typography>
            <ScrollShadow
              className={styles.slotsScroll()}
              hideScrollBar
              orientation="horizontal"
              size={40}
            >
              <div className={styles.slotsRow()}>
                {day.slots.map((slot) => {
                  const isUnavailable = slot.status === "unavailable";
                  const isSelected =
                    !isUnavailable && selectedSlotId === slot.id;

                  return (
                    <Button
                      aria-disabled={isUnavailable || undefined}
                      aria-label={slot.timeLabel}
                      aria-pressed={isUnavailable ? undefined : isSelected}
                      className={[
                        styles.slot(),
                        isUnavailable
                          ? styles.slotUnavailable()
                          : isSelected
                            ? styles.slotSelected()
                            : styles.slotAvailable(),
                      ].join(" ")}
                      isDisabled={isUnavailable}
                      key={slot.id}
                      onPress={() => onSlotPress(slot)}
                      variant="ghost"
                    >
                      {slot.timeLabel}
                    </Button>
                  );
                })}
              </div>
            </ScrollShadow>
          </div>
        ))}
      </div>
    </div>
  );
}
