import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DiscoveryClubReserveGate } from "@/modules/discovery/lib/DiscoveryClubReserveGate";
import {
  getAllClubIds,
  getClubDetail,
} from "@/modules/discovery/lib/club-detail-data";
import {
  buildDemoStaticParams,
  canUseDemoFixtureId,
  STATIC_EXPORT_PLACEHOLDER_ID,
} from "@/shared/lib/runtime-mode";

type ReservePageProps = {
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
}: ReservePageProps): Promise<Metadata> {
  const { clubId } = await params;
  const club = canUseDemoFixtureId(clubId) ? getClubDetail(clubId) : undefined;
  const t = await getTranslations("ReserveFlow");

  return { title: t("pageTitle", { club: club?.title ?? "" }) };
}

export default async function ClubReservePage({ params }: ReservePageProps) {
  const { clubId } = await params;

  return <DiscoveryClubReserveGate clubId={clubId} />;
}
