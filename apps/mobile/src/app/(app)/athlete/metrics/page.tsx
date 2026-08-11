import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AthleteMetricsGate } from "@/modules/athlete/lib/AthleteMetricsGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("FitnessMetrics");
  return { title: t("title") };
}

export default function AthleteMetricsPage() {
  return <AthleteMetricsGate />;
}
