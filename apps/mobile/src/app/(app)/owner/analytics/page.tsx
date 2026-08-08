import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  OWNER_ANALYTICS,
  OWNER_ANALYTICS_PERIODS,
} from "@/modules/owner/lib/owner-analytics-data";
import { OwnerAnalyticsScreen } from "@/modules/owner/screens/OwnerAnalyticsScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnerAnalytics");
  return { title: t("pageTitle") };
}

export default function OwnerAnalyticsPage() {
  return (
    <OwnerAnalyticsScreen
      datasets={OWNER_ANALYTICS}
      periods={OWNER_ANALYTICS_PERIODS}
    />
  );
}
