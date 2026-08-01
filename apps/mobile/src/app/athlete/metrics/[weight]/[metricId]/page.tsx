import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  isSupportedMetric,
  normalizeMetricSlug,
  SUPPORTED_METRICS,
} from "../lib/metrics";
import { getAllWeightDetailParams, getWeightDetail } from "../lib/weight-detail-data";
import { WeightDetailScreen } from "./weight-detail-screen";

type WeightDetailPageProps = {
  params: Promise<{ weight: string; metricId: string }>;
};

export function generateStaticParams() {
  return SUPPORTED_METRICS.flatMap((weight) => getAllWeightDetailParams(weight));
}

export async function generateMetadata({
  params,
}: WeightDetailPageProps): Promise<Metadata> {
  const { weight, metricId } = await params;
  if (!isSupportedMetric(weight) || !getWeightDetail(metricId)) {
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

  const detail = getWeightDetail(metricId);
  if (!detail) {
    notFound();
  }

  return <WeightDetailScreen detail={detail} metric={slug} />;
}
