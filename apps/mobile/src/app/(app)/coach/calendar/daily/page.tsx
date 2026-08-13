import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CoachCalendarDailyGate } from "@/modules/coach/lib/CoachCalendarDailyGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CoachCalendarDaily");
  return { title: t("title") };
}

export default function CoachCalendarDailyPage() {
  return <CoachCalendarDailyGate />;
}
