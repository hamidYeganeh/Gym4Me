import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DEFAULT_REORDERABLE_METRICS } from "@/modules/athlete/lib/metrics-reorder-data";
import { AthleteMetricsReorderScreen } from "@/modules/athlete/screens/AthleteMetricsReorderScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("FitnessMetricsReorder");
  return { title: t("title") };
}

export default function AthleteMetricsReorderPage() {
  return (
    <AthleteMetricsReorderScreen
      initialMetrics={DEFAULT_REORDERABLE_METRICS}
    />
  );
}
