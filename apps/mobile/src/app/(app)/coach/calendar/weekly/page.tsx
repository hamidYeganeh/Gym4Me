import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  COACH_CALENDAR_DEFAULT_WEEK_INDEX,
  COACH_CALENDAR_WEEKS,
} from "@/modules/coach/lib/calendar-weekly-data";
import { CoachCalendarWeeklyScreen } from "@/modules/coach/screens/CoachCalendarWeeklyScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CoachCalendarWeekly");
  return { title: t("title") };
}

export default function CoachCalendarWeeklyPage() {
  return (
    <CoachCalendarWeeklyScreen
      defaultWeekIndex={COACH_CALENDAR_DEFAULT_WEEK_INDEX}
      weeks={COACH_CALENDAR_WEEKS}
    />
  );
}
