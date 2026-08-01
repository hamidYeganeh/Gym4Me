import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  COACH_CALENDAR_DAILY_WORKOUTS,
  COACH_CALENDAR_DAYS,
  COACH_CALENDAR_DEFAULT_DAY_ID,
  COACH_CALENDAR_TIME_SLOTS,
} from "@/modules/coach/lib/calendar-daily-data";
import { CoachCalendarDailyScreen } from "@/modules/coach/screens/CoachCalendarDailyScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CoachCalendarDaily");
  return { title: t("title") };
}

export default function CoachCalendarDailyPage() {
  return (
    <CoachCalendarDailyScreen
      days={COACH_CALENDAR_DAYS}
      defaultDayId={COACH_CALENDAR_DEFAULT_DAY_ID}
      slots={COACH_CALENDAR_TIME_SLOTS}
      workouts={COACH_CALENDAR_DAILY_WORKOUTS}
    />
  );
}
