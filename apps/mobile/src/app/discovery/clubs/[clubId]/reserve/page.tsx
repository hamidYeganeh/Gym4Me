import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DiscoveryClubReserveGate } from "@/modules/discovery/lib/DiscoveryClubReserveGate";
import {
  getAllClubIds,
  getClubDetail,
} from "@/modules/discovery/lib/club-detail-data";

type ReservePageProps = {
  params: Promise<{ clubId: string }>;
};

export function generateStaticParams() {
  return getAllClubIds().map((clubId) => ({ clubId }));
}

export async function generateMetadata({
  params,
}: ReservePageProps): Promise<Metadata> {
  const { clubId } = await params;
  const club = getClubDetail(clubId);
  const t = await getTranslations("ReserveFlow");

  return { title: t("pageTitle", { club: club?.title ?? "" }) };
}

export default async function ClubReservePage({ params }: ReservePageProps) {
  const { clubId } = await params;

  return <DiscoveryClubReserveGate clubId={clubId} />;
}
