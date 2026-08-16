import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DiscoverySportDetailGate } from "@/modules/discovery/lib/DiscoverySportDetailGate";
import {
  getAllSportIds,
  getBrowseSport,
} from "@/modules/discovery/lib/sports-browse-data";

type SportDetailPageProps = {
  params: Promise<{ sportId: string }>;
};

export function generateStaticParams() {
  return getAllSportIds().map((sportId) => ({ sportId }));
}

export async function generateMetadata({
  params,
}: SportDetailPageProps): Promise<Metadata> {
  const { sportId } = await params;
  const sport = getBrowseSport(sportId);
  const t = await getTranslations("DiscoverySportDetail");

  if (!sport) {
    return { title: t("notFound") };
  }

  return { title: sport.name };
}

export default async function DiscoverySportDetailPage({
  params,
}: SportDetailPageProps) {
  const { sportId } = await params;

  return <DiscoverySportDetailGate sportId={sportId} />;
}
