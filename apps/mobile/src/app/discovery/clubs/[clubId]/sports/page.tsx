import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllClubIds,
  getClubDetail,
} from "@/modules/discovery/lib/club-detail-data";
import { DiscoveryClubsSportsScreen } from "@/modules/discovery/screens/DiscoveryClubsSportsScreen";

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
  const club = getClubDetail(clubId);

  if (!club) {
    notFound();
  }

  return <DiscoveryClubsSportsScreen club={club} />;
}
