import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllClubIds,
  getClubDetail,
} from "@/modules/discovery/lib/club-detail-data";
import { DiscoveryClubsReviewsScreen } from "@/modules/discovery/screens/DiscoveryClubsReviewsScreen";

type ClubReviewsPageProps = {
  params: Promise<{ clubId: string }>;
};

export function generateStaticParams() {
  return getAllClubIds().map((clubId) => ({ clubId }));
}

export async function generateMetadata({
  params,
}: ClubReviewsPageProps): Promise<Metadata> {
  const { clubId } = await params;
  const club = getClubDetail(clubId);

  if (!club) {
    return { title: "Reviews" };
  }

  return { title: `${club.title} — Reviews` };
}

export default async function ClubReviewsPage({
  params,
}: ClubReviewsPageProps) {
  const { clubId } = await params;
  const club = getClubDetail(clubId);

  if (!club) {
    notFound();
  }

  return <DiscoveryClubsReviewsScreen club={club} />;
}
