import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AthleteCheckInHistoryGate } from "@/modules/athlete/lib/AthleteCheckInHistoryGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteCheckInHistory");
  return { title: t("pageTitle") };
}

export default function AthleteCheckInHistoryPage() {
  return <AthleteCheckInHistoryGate />;
}
