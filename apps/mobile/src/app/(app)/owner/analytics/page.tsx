import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OwnerAnalyticsGate } from "@/modules/owner/lib/OwnerAnalyticsGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnerAnalytics");
  return { title: t("pageTitle") };
}

export default function OwnerAnalyticsPage() {
  return <OwnerAnalyticsGate />;
}
