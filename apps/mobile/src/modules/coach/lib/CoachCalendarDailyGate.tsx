"use client";

import { Spinner } from "@heroui/react";
import type { Booking, CoachSlot } from "@repo/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { coachBookings, coachSlots } from "@/shared/lib/api";
import { todayIso } from "@/shared/lib/week-calendar";
import { useAuth } from "@/shared/providers/AuthProvider";
import { CoachCalendarDailyScreen } from "../screens/CoachCalendarDailyScreen";
import {
  COACH_CALENDAR_DAILY_WORKOUTS,
  COACH_CALENDAR_DAYS,
  COACH_CALENDAR_DEFAULT_DAY_ID,
  COACH_CALENDAR_TIME_SLOTS,
  type CoachCalendarDailyWorkout,
  type CoachCalendarDay,
} from "./calendar-daily-data";
import {
  buildDailyDays,
  dailyTimeSlots,
  mapCalendarDailyWorkouts,
  markDailyDaysWithWorkouts,
} from "./api-coach-calendar";

type DailyState = {
  days: CoachCalendarDay[];
  defaultDayId: string;
  workoutsByDayId: Record<string, CoachCalendarDailyWorkout[]>;
};

export function CoachCalendarDailyGate() {
  const { isAuthenticated, isReady, activeRole } = useAuth();
  const isLive = isAuthenticated && activeRole === "coach";
  const [state, setState] = useState<DailyState | null>(null);

  const demoState = useMemo<DailyState>(
    () => ({
      days: COACH_CALENDAR_DAYS,
      defaultDayId: COACH_CALENDAR_DEFAULT_DAY_ID,
      workoutsByDayId: Object.fromEntries(
        COACH_CALENDAR_DAYS.map((day) => [
          day.id,
          COACH_CALENDAR_DAILY_WORKOUTS,
        ]),
      ),
    }),
    [],
  );

  const load = useCallback(async () => {
    const built = buildDailyDays(todayIso());
    const [slotsResponse, bookingsPage] = await Promise.all([
      coachSlots.list({ from: built.range.from, to: built.range.to }),
      coachBookings.list({
        page_size: 100,
        from: built.range.from,
        to: built.range.to,
      }),
    ]);
    const slots: CoachSlot[] = slotsResponse.slots;
    const bookings: Booking[] = bookingsPage.result;
    const days = markDailyDaysWithWorkouts(built.days, bookings, slots);
    const workoutsByDayId: Record<string, CoachCalendarDailyWorkout[]> = {};
    for (const day of days) {
      workoutsByDayId[day.id] = mapCalendarDailyWorkouts({
        bookings,
        slots,
        dayId: day.id,
      });
    }
    setState({
      days,
      defaultDayId: built.defaultDayId,
      workoutsByDayId,
    });
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (!isLive) {
      setState(demoState);
      return;
    }
    load().catch(() => setState(demoState));
  }, [demoState, isLive, isReady, load]);

  if (!state) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <CoachCalendarDailyScreen
      days={state.days}
      defaultDayId={state.defaultDayId}
      slots={isLive ? dailyTimeSlots() : COACH_CALENDAR_TIME_SLOTS}
      workouts={
        state.workoutsByDayId[state.defaultDayId] ??
        Object.values(state.workoutsByDayId)[0] ??
        []
      }
      workoutsByDayId={state.workoutsByDayId}
    />
  );
}
