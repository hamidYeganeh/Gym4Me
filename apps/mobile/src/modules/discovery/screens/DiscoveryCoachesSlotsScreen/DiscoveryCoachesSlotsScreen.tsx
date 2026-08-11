"use client";

import { Avatar, Button, ScrollShadow, Typography } from "@heroui/react";
import { Calendar1 } from "@repo/icons/Calendar1";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { Plus } from "@repo/icons/Plus";
import { StarFull } from "@repo/icons/StarFull";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { StickyBottomActions } from "@repo/ui/kit/StickyBottomActions";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useRequireAuthAction } from "@/shared/hooks/useRequireAuthAction";
import {
  addDaysIso,
  formatJalaliDateShort,
  formatJalaliRangeLabel,
  todayIso,
  weekdayKey,
  weekdaySat0,
  weekRangeContaining,
} from "../../lib/club-calendar-data";
import type {
  CoachSlotDayView,
  CoachSlotView,
} from "@/shared/hooks/useCoachSlotsWeek";
import { useDiscoveryCoachSlotsWeek } from "../../lib/use-discovery-coach-slots";
import { discoveryCoachesSlotsScreenStyles as styles } from "./DiscoveryCoachesSlotsScreen.styles";
import type { DiscoveryCoachesSlotsScreenProps } from "./DiscoveryCoachesSlotsScreen.types";

function formatRating(rating: number) {
  return Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2);
  return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`;
}

export function DiscoveryCoachesSlotsScreen({
  coach,
}: DiscoveryCoachesSlotsScreenProps) {
  const t = useTranslations("CoachDetail");
  const router = useRouter();
  const { runWithAuth } = useRequireAuthAction();
  const today = useMemo(() => todayIso(), []);
  const [anchor, setAnchor] = useState(today);

  const range = weekRangeContaining(anchor);

  const { days } = useDiscoveryCoachSlotsWeek(coach.id, range.from);

  const firstAvailableId = useMemo(() => {
    for (const day of days) {
      const slot = day.slots.find((entry) => entry.status === "available");
      if (slot) return slot.id;
    }
    return undefined;
  }, [days]);

  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>(
    firstAvailableId,
  );

  useEffect(() => {
    setSelectedSlotId(firstAvailableId);
  }, [firstAvailableId]);

  const selected = useMemo(() => {
    for (const day of days) {
      const slot = day.slots.find((entry) => entry.id === selectedSlotId);
      if (slot && slot.status === "available") return { day, slot };
    }
    return null;
  }, [days, selectedSlotId]);

  const goWeek = (delta: number) => {
    setAnchor(addDaysIso(range.from, delta * 7));
  };

  const dayLabel = (day: CoachSlotDayView) => {
    const dateLabel = formatJalaliDateShort(day.date);
    if (day.date !== today) return dateLabel;
    const weekday = t(`slotsWeekday.${weekdayKey(weekdaySat0(day.date))}`);
    return t("slotsDayToday", { weekday, date: dateLabel });
  };

  const selectionSummary = selected
    ? t("slotsYouSelected", {
        date: formatJalaliDateShort(selected.day.date),
        time: selected.slot.timeLabel,
      })
    : t("slotsSelectPrompt");

  const onSlotPress = (slot: CoachSlotView) => {
    if (slot.status === "unavailable") return;
    setSelectedSlotId(slot.id);
  };

  const onBook = () => {
    if (!selected) return;
    const reserveHref = `/discovery/coaches/${coach.id}/reserve?slotId=${encodeURIComponent(selected.slot.id)}`;
    runWithAuth(() => router.push(reserveHref), reserveHref);
  };

  const avatarSrc = coach.avatar?.trim() || PLACEHOLDER_IMAGE;

  return (
    <AppLayout
      className={styles.root}
      header={
        <Header
          endContent={
            <Button
              aria-label={t("slotsOpenCalendar")}
              className="relative"
              isIconOnly
              size="lg"
              variant="ghost"
            >
              <Calendar1 className="text-foreground" size={22} />
              <span aria-hidden className={styles.calendarBadge} />
            </Button>
          }
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.back()}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
        />
      }
    >
      <div className={styles.main}>
        <div className={styles.coachRow}>
          <Avatar className={styles.avatar} size="lg">
            <Avatar.Image alt={coach.name} src={avatarSrc} />
            <Avatar.Fallback>{initialsFromName(coach.name)}</Avatar.Fallback>
          </Avatar>
          <div className={styles.coachMeta}>
            <Typography className={styles.coachName} weight="bold">
              {coach.name}
            </Typography>
            <Typography className={styles.coachSpecialty} type="body-sm">
              {coach.specialty}
            </Typography>
          </div>
          <div className={styles.rating}>
            <Typography className={styles.ratingValue} weight="semibold">
              {formatRating(coach.rating)}
            </Typography>
            <StarFull aria-hidden className={styles.ratingStar} size={16} />
          </div>
        </div>

        <div className={styles.weekRow}>
          <Typography className={styles.weekLabel} weight="bold">
            {formatJalaliRangeLabel(range.from, range.to)}
          </Typography>
          <div className={styles.weekNav}>
            <Button
              aria-label={t("slotsPrevWeek")}
              className={styles.weekButton}
              isIconOnly
              onPress={() => goWeek(-1)}
              size="lg"
            >
              <ChevronRight
                aria-hidden
                className={styles.weekButtonIcon}
                rtlMirror={false}
                size={18}
              />
            </Button>
            <Button
              aria-label={t("slotsNextWeek")}
              className={styles.weekButton}
              isIconOnly
              onPress={() => goWeek(1)}
              size="lg"
            >
              <ChevronLeft
                aria-hidden
                className={styles.weekButtonIcon}
                rtlMirror={false}
                size={18}
              />
            </Button>
          </div>
        </div>

        <div className={styles.days}>
          {days.map((day) => (
            <div className={styles.day} key={day.id}>
              <Typography className={styles.dayLabel} weight="bold">
                {dayLabel(day)}
              </Typography>
              <ScrollShadow
                className={styles.slotsScroll}
                hideScrollBar
                orientation="horizontal"
                size={40}
              >
                <div className={styles.slotsRow}>
                  {day.slots.map((slot) => {
                    const isUnavailable = slot.status === "unavailable";
                    const isSelected =
                      !isUnavailable && selected?.slot.id === slot.id;

                    return (
                      <Button
                        aria-disabled={isUnavailable || undefined}
                        aria-label={slot.timeLabel}
                        aria-pressed={isUnavailable ? undefined : isSelected}
                        className={[
                          styles.slot,
                          isUnavailable
                            ? styles.slotUnavailable
                            : isSelected
                              ? styles.slotSelected
                              : styles.slotAvailable,
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

      <StickyBottomActions contentClassName={styles.footer}>
        <Typography className={styles.selectionSummary} type="body-sm">
          {selectionSummary}
        </Typography>
        <Button
          className={styles.bookButton}
          isDisabled={!selected}
          onPress={onBook}
          size="lg"
        >
          <Typography className={styles.bookLabel} weight="bold">
            {t("bookConsultation")}
          </Typography>
          <Plus aria-hidden className={styles.bookIcon} size={20} />
        </Button>
      </StickyBottomActions>
    </AppLayout>
  );
}
