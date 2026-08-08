import type { Metadata } from "next";
import { DiscoveryClubDetailGate } from "@/modules/discovery/lib/DiscoveryClubDetailGate";
import { getAllClubIds, getClubDetail } from "@/modules/discovery/lib/club-detail-data";

type ClubSportsPageProps = {
  params: Promise<{ clubId: string }>;
};

export function generateStaticParams() {
  return getAllClubIds().map((clubId) => ({ clubId }));
}

export async function generateMetadata({
  params,
}: ClubSportsPageProps): Promise<Metadata> {
  const { clubId } = await params;
  const club = getClubDetail(clubId);

  if (!club) {
    return { title: "Sports" };
  }

  return { title: `${club.title} — Sports` };
}

export default async function ClubSportsPage({ params }: ClubSportsPageProps) {
  const { clubId } = await params;

  return <DiscoveryClubDetailGate clubId={clubId} view="sports" />;
}
