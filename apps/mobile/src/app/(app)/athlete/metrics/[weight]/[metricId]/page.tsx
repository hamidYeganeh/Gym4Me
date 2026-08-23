import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  isSupportedMetric,
  normalizeMetricSlug,
  SUPPORTED_METRICS,
} from "@/modules/athlete/lib/weight/metrics";
import {
  getAllWeightDetailParams,
  getWeightDetail,
} from "@/modules/athlete/lib/weight/weight-detail-data";
import { AthleteWeightDetailScreen } from "@/modules/athlete/screens/AthleteWeightDetailScreen";
import {
  buildDemoStaticParams,
  canUseDemoFixtureId,
  STATIC_EXPORT_PLACEHOLDER_ID,
} from "@/shared/lib/runtime-mode";

type WeightDetailPageProps = {
  params: Promise<{ weight: string; metricId: string }>;
};

export function generateStaticParams() {
  return buildDemoStaticParams(
    () =>
      SUPPORTED_METRICS.flatMap((weight) => getAllWeightDetailParams(weight)),
    [{ weight: "weight", metricId: STATIC_EXPORT_PLACEHOLDER_ID }],
  );
}

export async function generateMetadata({
  params,
}: WeightDetailPageProps): Promise<Metadata> {
  const { weight, metricId } = await params;
  if (
    !isSupportedMetric(weight) ||
    !canUseDemoFixtureId(metricId) ||
    !getWeightDetail(metricId)
  ) {
    return { title: "Detail" };
  }

  const t = await getTranslations("WeightDetail");
  return { title: t("title") };
}

export default async function WeightDetailPage({
  params,
}: WeightDetailPageProps) {
  const { weight, metricId } = await params;
  const slug = normalizeMetricSlug(weight);

  if (!isSupportedMetric(slug)) {
    notFound();
  }

  const detail = canUseDemoFixtureId(metricId)
    ? getWeightDetail(metricId)
    : null;
  if (!detail) {
    notFound();
  }

  return <AthleteWeightDetailScreen detail={detail} metric={slug} />;
}
