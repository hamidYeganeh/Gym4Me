import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  isSupportedMetric,
  normalizeMetricSlug,
  SUPPORTED_METRICS,
} from "@/modules/athlete/lib/weight/metrics";
import { AthleteWeightHistoryScreen } from "@/modules/athlete/screens/AthleteWeightHistoryScreen";

type WeightHistoryPageProps = {
  params: Promise<{ weight: string }>;
};

export function generateStaticParams() {
  return SUPPORTED_METRICS.map((weight) => ({ weight }));
}

export async function generateMetadata({
  params,
}: WeightHistoryPageProps): Promise<Metadata> {
  const { weight } = await params;
  if (!isSupportedMetric(weight)) {
    return { title: "History" };
  }

  const t = await getTranslations("WeightHistory");
  return { title: t("title") };
}

export default async function WeightHistoryPage({
  params,
}: WeightHistoryPageProps) {
  const { weight } = await params;
  const slug = normalizeMetricSlug(weight);

  if (!isSupportedMetric(slug)) {
    notFound();
  }

  return <AthleteWeightHistoryScreen metric={slug} />;
}
