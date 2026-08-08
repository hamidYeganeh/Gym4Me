import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  getAllClubIds,
  getClubDetail,
} from "@/modules/discovery/lib/club-detail-data";
import {
  RESERVE_DAYS,
  RESERVE_PLANS,
  RESERVE_SLOTS_BY_DAY,
} from "@/modules/discovery/lib/reserve-data";
import { DiscoveryClubsReserveScreen } from "@/modules/discovery/screens/DiscoveryClubsReserveScreen";

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
  const club = getClubDetail(clubId);

  return (
    <DiscoveryClubsReserveScreen
      clubTitle={club?.title ?? ""}
      days={RESERVE_DAYS}
      plans={RESERVE_PLANS}
      slotsByDay={RESERVE_SLOTS_BY_DAY}
    />
  );
}
