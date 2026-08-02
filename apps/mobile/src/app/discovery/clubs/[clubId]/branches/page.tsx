import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllClubIds,
  getClubDetail,
} from "@/modules/discovery/lib/club-detail-data";
import { DiscoveryClubsBranchesScreen } from "@/modules/discovery/screens/DiscoveryClubsBranchesScreen";

type ClubBranchesPageProps = {
  params: Promise<{ clubId: string }>;
};

export function generateStaticParams() {
  return getAllClubIds().map((clubId) => ({ clubId }));
}

export async function generateMetadata({
  params,
}: ClubBranchesPageProps): Promise<Metadata> {
  const { clubId } = await params;
  const club = getClubDetail(clubId);

  if (!club) {
    return { title: "Branches" };
  }

  return { title: `${club.title} — Branches` };
}

export default async function ClubBranchesPage({
  params,
}: ClubBranchesPageProps) {
  const { clubId } = await params;
  const club = getClubDetail(clubId);

  if (!club) {
    notFound();
  }

  return <DiscoveryClubsBranchesScreen club={club} />;
}
