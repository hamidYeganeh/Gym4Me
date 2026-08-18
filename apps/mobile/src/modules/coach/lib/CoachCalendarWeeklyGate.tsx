"use client";

import { Spinner } from "@heroui/react/spinner";
import { useCallback, useEffect, useState } from "react";
import { coachBookings, coachSlots } from "@/shared/lib/api";
import { todayIso } from "@/shared/lib/week-calendar";
import { useAuth } from "@/shared/providers/AuthProvider";
import { CoachCalendarWeeklyScreen } from "../screens/CoachCalendarWeeklyScreen";
import {
  COACH_CALENDAR_DEFAULT_WEEK_INDEX,
  COACH_CALENDAR_WEEKS,
  type CoachCalendarWeek,
} from "./calendar-weekly-data";
import { buildWeeklyWeekStarts, mapWeeklyWeeks } from "./api-coach-calendar";

export function CoachCalendarWeeklyGate() {
  const { isAuthenticated, isReady, activeRole } = useAuth();
  const isLive = isAuthenticated && activeRole === "coach";
  const [weeks, setWeeks] = useState<CoachCalendarWeek[] | null>(null);
  const [defaultWeekIndex, setDefaultWeekIndex] = useState(
    COACH_CALENDAR_DEFAULT_WEEK_INDEX,
  );

  const load = useCallback(async () => {
    const built = buildWeeklyWeekStarts(todayIso());
    const [slotsResponse, bookingsPage] = await Promise.all([
      coachSlots.list({ from: built.range.from, to: built.range.to }),
      coachBookings.list({
        page_size: 100,
        from: built.range.from,
        to: built.range.to,
      }),
    ]);
    setWeeks(
      mapWeeklyWeeks({
        weekStarts: built.weekStarts,
        bookings: bookingsPage.result,
        slots: slotsResponse.slots,
      }),
    );
    setDefaultWeekIndex(built.defaultWeekIndex);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (!isLive) {
      setWeeks(COACH_CALENDAR_WEEKS);
      setDefaultWeekIndex(COACH_CALENDAR_DEFAULT_WEEK_INDEX);
      return;
    }
    load().catch(() => {
      setWeeks(COACH_CALENDAR_WEEKS);
      setDefaultWeekIndex(COACH_CALENDAR_DEFAULT_WEEK_INDEX);
    });
  }, [isLive, isReady, load]);

  if (!weeks) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <CoachCalendarWeeklyScreen
      defaultWeekIndex={defaultWeekIndex}
      weeks={weeks}
    />
  );
}
