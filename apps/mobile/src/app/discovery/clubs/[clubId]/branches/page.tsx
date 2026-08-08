import type { Metadata } from "next";
import { DiscoveryClubDetailGate } from "@/modules/discovery/lib/DiscoveryClubDetailGate";
import { getAllClubIds, getClubDetail } from "@/modules/discovery/lib/club-detail-data";

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

  return <DiscoveryClubDetailGate clubId={clubId} view="branches" />;
}
