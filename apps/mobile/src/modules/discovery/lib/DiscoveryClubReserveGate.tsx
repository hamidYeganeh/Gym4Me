"use client";

import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { ApiError, type ClubCalendarResponse } from "@repo/api";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  accountBookings,
  discoveryClubSlots,
  isDiscoveryApiId,
  isDiscoveryDemoId,
} from "@/shared/lib/api";
import {
  addDaysIso,
  formatJalaliDateShort,
  todayIso,
  weekdaySat0,
} from "@/shared/lib/week-calendar";
import { DiscoveryClubsReserveScreen } from "../screens/DiscoveryClubsReserveScreen";
import {
  RESERVE_DAYS,
  RESERVE_PLANS,
  RESERVE_SLOTS_BY_DAY,
  type ReserveDay,
  type ReservePlan,
  type ReserveSlot,
} from "./reserve-data";
import { useDiscoveryClubDetail } from "./use-discovery-club-detail";

const WEEKDAY_FA = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
] as const;

const CALENDAR_DAYS = 7;
const PACK_SESSION_COUNT = 4;
const LOW_CAPACITY_THRESHOLD = 2;

function occurrenceSlotState(remaining: number): ReserveSlot["state"] {
  if (remaining <= 0) return "full";
  if (remaining <= LOW_CAPACITY_THRESHOLD) return "low";
  return "available";
}

function mapCalendar(calendar: ClubCalendarResponse): {
  days: ReserveDay[];
  slotsByDay: Record<string, ReserveSlot[]>;
} {
  const days: ReserveDay[] = [];
  const slotsByDay: Record<string, ReserveSlot[]> = {};

  for (const day of calendar.days) {
    const slots: ReserveSlot[] = day.items
      .filter((item) => item.occurrenceStatus === "scheduled")
      .map((item) => {
        const remaining = Math.max(0, item.remaining);
        return {
          id: `${item.slotId}__${day.date}`,
          timeLabel: `${item.startTime} تا ${item.endTime}`,
          capacityLabel:
            remaining > 0
              ? `${remaining.toLocaleString("fa-IR")} جای خالی`
              : "تکمیل",
          state: occurrenceSlotState(remaining),
          api: { slotId: item.slotId, date: day.date, price: item.price },
        };
      });

    slotsByDay[day.date] = slots;
    days.push({
      id: day.date,
      weekdayLabel: WEEKDAY_FA[weekdaySat0(day.date)] ?? "",
      dayLabel: formatJalaliDateShort(day.date),
      dateLabel: formatJalaliDateShort(day.date),
      availability: slots.some((slot) => slot.state !== "full")
        ? "available"
        : "unavailable",
    });
  }

  return { days, slotsByDay };
}

type Props = {
  clubId: string;
};

/**
 * Client gate: live club calendar + booking for API clubs. Static fixtures are
 * display-only and available solely in explicit non-production demo mode.
 */
export function DiscoveryClubReserveGate({ clubId }: Props) {
  const bookingAttemptKey = useRef<string | null>(null);
  const t = useTranslations("ReserveFlow");
  const router = useRouter();
  const isApi = isDiscoveryApiId(clubId);
  const isDemo = isDiscoveryDemoId(clubId);
  const { club, isLoading: isClubLoading } = useDiscoveryClubDetail(clubId);

  const [calendar, setCalendar] = useState<ClubCalendarResponse | null>(null);
  const [isCalendarLoading, setIsCalendarLoading] = useState(isApi);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!isApi) return;
    let cancelled = false;
    const from = todayIso();
    discoveryClubSlots
      .getCalendar(clubId, { from, to: addDaysIso(from, CALENDAR_DAYS - 1) })
      .then((result) => {
        if (!cancelled) setCalendar(result);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setIsCalendarLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [clubId, isApi]);

  const plans = useMemo<ReservePlan[]>(
    () => [
      {
        id: "plan-single",
        title: t("planSingleTitle"),
        price: 0,
        priceSuffix: t("priceSuffix"),
        description: t("planSingleDescription"),
        sessionCount: 1,
      },
      {
        id: "plan-pack",
        title: t("planPackTitle", { count: PACK_SESSION_COUNT }),
        price: 0,
        priceSuffix: t("priceSuffix"),
        description: t("planPackDescription", { count: PACK_SESSION_COUNT }),
        sessionCount: PACK_SESSION_COUNT,
      },
    ],
    [t],
  );

  const mapped = useMemo(
    () => (calendar ? mapCalendar(calendar) : null),
    [calendar],
  );

  if (isDemo) {
    return (
      <DiscoveryClubsReserveScreen
        clubImage={club?.images[0] ?? PLACEHOLDER_IMAGE}
        clubLocation={club?.location}
        clubTitle={club?.title ?? ""}
        days={RESERVE_DAYS}
        plans={RESERVE_PLANS}
        slotsByDay={RESERVE_SLOTS_BY_DAY}
      />
    );
  }

  if (isClubLoading || isCalendarLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (loadError || !mapped) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-6 text-center">
        <Typography className="text-muted" type="body">
          {t("loadError")}
        </Typography>
      </div>
    );
  }

  const onConfirm = async ({
    slot,
    plan,
  }: {
    slot: ReserveSlot;
    plan: ReservePlan;
  }) => {
    if (!slot.api) return;
    const sessionCount = plan.sessionCount ?? 1;
    const dates = Array.from({ length: sessionCount }, (_, index) =>
      addDaysIso(slot.api!.date, index * 7),
    );
    try {
      const idempotencyKey =
        bookingAttemptKey.current ??
        `club-booking:${globalThis.crypto?.randomUUID?.() ?? Date.now()}`;
      bookingAttemptKey.current = idempotencyKey;
      const result = await accountBookings.createClub({
        clubId,
        slotId: slot.api.slotId,
        dates,
        idempotencyKey,
      });
      bookingAttemptKey.current = null;
      const booking = result.bookings[0];
      if (!booking) throw new Error(t("submitError"));
      if (booking.status === "awaiting_payment") {
        const payment = await accountBookings.pay(
          booking.id,
          `${window.location.origin}/athlete/bookings/${booking.id}`,
        );
        window.location.assign(payment.redirectUrl);
        return;
      }
      router.replace(`/athlete/bookings/${booking.id}`);
    } catch (error) {
      throw new Error(
        error instanceof ApiError && error.message
          ? error.message
          : t("submitError"),
      );
    }
  };

  return (
    <DiscoveryClubsReserveScreen
      clubImage={club?.images[0] ?? PLACEHOLDER_IMAGE}
      clubLocation={club?.location}
      clubTitle={club?.title ?? ""}
      days={mapped.days}
      onConfirm={onConfirm}
      plans={plans}
      slotsByDay={mapped.slotsByDay}
    />
  );
}
