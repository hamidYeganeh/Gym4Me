import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DiscoveryCoachDetailGate } from "@/modules/discovery/lib/DiscoveryCoachDetailGate";
import {
  getAllCoachIds,
  getCoachDetail,
} from "@/modules/discovery/lib/coach-detail-data";

type CoachReviewsPageProps = {
  params: Promise<{ coachId: string }>;
};

export function generateStaticParams() {
  return getAllCoachIds().map((coachId) => ({ coachId }));
}

export async function generateMetadata({
  params,
}: CoachReviewsPageProps): Promise<Metadata> {
  const { coachId } = await params;
  const coach = getCoachDetail(coachId);
  const t = await getTranslations("CoachDetail");

  if (!coach) {
    return { title: t("notFound") };
  }

  return { title: `${coach.name} — ${t("reviewsPageTitle")}` };
}

export default async function CoachReviewsPage({
  params,
}: CoachReviewsPageProps) {
  const { coachId } = await params;

  return <DiscoveryCoachDetailGate coachId={coachId} view="reviews" />;
}
