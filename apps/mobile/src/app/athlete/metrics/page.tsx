import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  ATHLETE_METRICS,
  METRICS_PROMO_IMAGE,
} from "@/modules/athlete/lib/metrics-overview-data";
import { AthleteMetricsScreen } from "@/modules/athlete/screens/AthleteMetricsScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("FitnessMetrics");
  return { title: t("title") };
}

export default function AthleteMetricsPage() {
  return (
    <AthleteMetricsScreen
      metrics={ATHLETE_METRICS}
      promoImage={METRICS_PROMO_IMAGE}
    />
  );
}
