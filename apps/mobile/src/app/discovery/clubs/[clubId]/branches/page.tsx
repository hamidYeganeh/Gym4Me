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

type ClubBranchesPageProps = {
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
}: ClubBranchesPageProps): Promise<Metadata> {
  const { clubId } = await params;
  const club = canUseDemoFixtureId(clubId) ? getClubDetail(clubId) : undefined;

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
