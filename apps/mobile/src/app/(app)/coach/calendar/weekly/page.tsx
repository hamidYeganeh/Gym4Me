import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CoachCalendarWeeklyGate } from "@/modules/coach/lib/CoachCalendarWeeklyGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CoachCalendarWeekly");
  return { title: t("title") };
}

export default function CoachCalendarWeeklyPage() {
  return <CoachCalendarWeeklyGate />;
}
