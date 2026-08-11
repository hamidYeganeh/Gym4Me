import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DiscoveryCoachDetailGate } from "@/modules/discovery/lib/DiscoveryCoachDetailGate";
import {
  getAllCoachIds,
  getCoachDetail,
} from "@/modules/discovery/lib/coach-detail-data";

type CoachSlotsPageProps = {
  params: Promise<{ coachId: string }>;
};

export function generateStaticParams() {
  return getAllCoachIds().map((coachId) => ({ coachId }));
}

export async function generateMetadata({
  params,
}: CoachSlotsPageProps): Promise<Metadata> {
  const { coachId } = await params;
  const coach = getCoachDetail(coachId);
  const t = await getTranslations("CoachDetail");

  if (!coach) {
    return { title: t("notFound") };
  }

  return { title: `${coach.name} — ${t("slotsPageTitle")}` };
}

export default async function CoachSlotsPage({ params }: CoachSlotsPageProps) {
  const { coachId } = await params;

  return <DiscoveryCoachDetailGate coachId={coachId} view="slots" />;
}
