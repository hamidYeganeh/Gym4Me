import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DiscoveryCoachDetailGate } from "@/modules/discovery/lib/DiscoveryCoachDetailGate";
import {
  getAllCoachIds,
  getCoachDetail,
} from "@/modules/discovery/lib/coach-detail-data";
import {
  buildDemoStaticParams,
  canUseDemoFixtureId,
  STATIC_EXPORT_PLACEHOLDER_ID,
} from "@/shared/lib/runtime-mode";

type CoachReviewsPageProps = {
  params: Promise<{ coachId: string }>;
};

export function generateStaticParams() {
  return buildDemoStaticParams(
    () => getAllCoachIds().map((coachId) => ({ coachId })),
    [{ coachId: STATIC_EXPORT_PLACEHOLDER_ID }],
  );
}

export async function generateMetadata({
  params,
}: CoachReviewsPageProps): Promise<Metadata> {
  const { coachId } = await params;
  const coach = canUseDemoFixtureId(coachId)
    ? getCoachDetail(coachId)
    : undefined;
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
