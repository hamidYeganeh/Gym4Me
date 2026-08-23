import type { Metadata } from "next";
import { DiscoveryClubDetailGate } from "@/modules/discovery/lib/DiscoveryClubDetailGate";
import {
  getAllClubIds,
  getClubDetail,
} from "@/modules/discovery/lib/club-detail-data";
import {
  buildDemoStaticParams,
  canUseDemoFixtureId,
  STATIC_EXPORT_PLACEHOLDER_ID,
} from "@/shared/lib/runtime-mode";

type ClubSportsPageProps = {
  params: Promise<{ clubId: string }>;
};

export function generateStaticParams() {
  return buildDemoStaticParams(
    () => getAllClubIds().map((clubId) => ({ clubId })),
    [{ clubId: STATIC_EXPORT_PLACEHOLDER_ID }],
  );
}

export async function generateMetadata({
  params,
}: ClubSportsPageProps): Promise<Metadata> {
  const { clubId } = await params;
  const club = canUseDemoFixtureId(clubId) ? getClubDetail(clubId) : undefined;

  if (!club) {
    return { title: "Sports" };
  }

  return { title: `${club.title} — Sports` };
}

export default async function ClubSportsPage({ params }: ClubSportsPageProps) {
  const { clubId } = await params;

  return <DiscoveryClubDetailGate clubId={clubId} view="sports" />;
}
