import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { COACH_ANALYTICS } from "@/modules/coach/lib/coach-analytics-data";
import { CoachAnalyticsScreen } from "@/modules/coach/screens/CoachAnalyticsScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CoachAnalytics");
  return { title: t("pageTitle") };
}

export default function CoachAnalyticsPage() {
  return <CoachAnalyticsScreen analytics={COACH_ANALYTICS} />;
}
