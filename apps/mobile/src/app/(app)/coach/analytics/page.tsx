import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CoachAnalyticsGate } from "@/modules/coach/lib/CoachAnalyticsGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CoachAnalytics");
  return { title: t("pageTitle") };
}

export default function CoachAnalyticsPage() {
  return <CoachAnalyticsGate />;
}
