import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { DiscoveryCoachDetailGate } from "@/modules/discovery/lib/DiscoveryCoachDetailGate";
import {
  getAllCoachIds,
  getCoachDetail,
} from "@/modules/discovery/lib/coach-detail-data";

type CoachReservePageProps = {
  params: Promise<{ coachId: string }>;
};

export function generateStaticParams() {
  return getAllCoachIds().map((coachId) => ({ coachId }));
}

export async function generateMetadata({
  params,
}: CoachReservePageProps): Promise<Metadata> {
  const { coachId } = await params;
  const coach = getCoachDetail(coachId);
  const t = await getTranslations("CoachReserve");

  return { title: coach ? `${coach.name} — ${t("pageTitle")}` : t("pageTitle") };
}

export default async function CoachReservePage({
  params,
}: CoachReservePageProps) {
  const { coachId } = await params;

  return (
    <Suspense>
      <DiscoveryCoachDetailGate coachId={coachId} view="reserve" />
    </Suspense>
  );
}
