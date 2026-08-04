import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  isSupportedMetric,
  normalizeMetricSlug,
  SUPPORTED_METRICS,
} from "@/modules/athlete/lib/weight/metrics";
import { AthleteWeightMetricsScreen } from "@/modules/athlete/screens/AthleteWeightMetricsScreen";

type WeightMetricsPageProps = {
  params: Promise<{ weight: string }>;
};

export function generateStaticParams() {
  return SUPPORTED_METRICS.map((weight) => ({ weight }));
}

export async function generateMetadata({
  params,
}: WeightMetricsPageProps): Promise<Metadata> {
  const { weight } = await params;
  if (!isSupportedMetric(weight)) {
    return { title: "Metrics" };
  }

  const t = await getTranslations("WeightMetrics");
  return { title: t("title") };
}

export default async function WeightMetricsPage({
  params,
}: WeightMetricsPageProps) {
  const { weight } = await params;
  const slug = normalizeMetricSlug(weight);

  if (!isSupportedMetric(slug)) {
    notFound();
  }

  return <AthleteWeightMetricsScreen metric={slug} />;
}
