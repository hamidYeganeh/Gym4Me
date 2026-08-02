import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllClubIds,
  getClubDetail,
} from "@/modules/discovery/lib/club-detail-data";
import { DiscoveryClubsClassesScreen } from "@/modules/discovery/screens/DiscoveryClubsClassesScreen";

type ClubClassesPageProps = {
  params: Promise<{ clubId: string }>;
};

export function generateStaticParams() {
  return getAllClubIds().map((clubId) => ({ clubId }));
}

export async function generateMetadata({
  params,
}: ClubClassesPageProps): Promise<Metadata> {
  const { clubId } = await params;
  const club = getClubDetail(clubId);

  if (!club) {
    return { title: "Classes" };
  }

  return { title: `${club.title} — Classes` };
}

export default async function ClubClassesPage({ params }: ClubClassesPageProps) {
  const { clubId } = await params;
  const club = getClubDetail(clubId);

  if (!club) {
    notFound();
  }

  return <DiscoveryClubsClassesScreen club={club} />;
}
