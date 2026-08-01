import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllClubIds,
  getClubDetail,
} from "@/modules/discovery/lib/club-detail-data";
import { DiscoveryClubsDetailScreen } from "@/modules/discovery/screens/DiscoveryClubsDetailScreen";

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
  const club = getClubDetail(clubId);

  if (!club) {
    notFound();
  }

  return <DiscoveryClubsDetailScreen club={club} />;
}
