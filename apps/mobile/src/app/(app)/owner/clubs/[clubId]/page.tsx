import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  getAllOwnerClubIds,
  getOwnerClubDetail,
} from "@/modules/owner/lib/owner-club-detail-data";
import { OwnerClubDetailScreen } from "@/modules/owner/screens/OwnerClubDetailScreen";

type OwnerClubDetailPageProps = {
  params: Promise<{ clubId: string }>;
};

export function generateStaticParams() {
  return getAllOwnerClubIds().map((clubId) => ({ clubId }));
}

export async function generateMetadata({
  params,
}: OwnerClubDetailPageProps): Promise<Metadata> {
  const { clubId } = await params;
  const club = getOwnerClubDetail(clubId);

  if (!club) {
    const t = await getTranslations("OwnerClubDetail");
    return { title: t("pageTitle") };
  }

  return { title: club.name };
}

export default async function OwnerClubDetailPage({
  params,
}: OwnerClubDetailPageProps) {
  const { clubId } = await params;
  const club = getOwnerClubDetail(clubId);

  if (!club) {
    return null;
  }

  return <OwnerClubDetailScreen club={club} />;
}
