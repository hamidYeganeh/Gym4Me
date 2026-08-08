import type { Metadata } from "next";
import { DiscoveryClubDetailGate } from "@/modules/discovery/lib/DiscoveryClubDetailGate";
import { getAllClubIds, getClubDetail } from "@/modules/discovery/lib/club-detail-data";

type ClubDetailPageProps = {
  params: Promise<{ clubId: string }>;
};

export function generateStaticParams() {
  return getAllClubIds().map((clubId) => ({ clubId }));
}

export async function generateMetadata({
  params,
}: ClubDetailPageProps): Promise<Metadata> {
  const { clubId } = await params;
  const club = getClubDetail(clubId);

  if (!club) {
    return { title: "Club" };
  }

  return { title: club.title };
}

export default async function ClubDetailPage({ params }: ClubDetailPageProps) {
  const { clubId } = await params;

  return <DiscoveryClubDetailGate clubId={clubId} view="detail" />;
}
