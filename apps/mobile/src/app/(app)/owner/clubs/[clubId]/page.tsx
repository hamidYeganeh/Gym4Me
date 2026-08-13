import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OwnerClubDetailGate } from "@/modules/owner/lib/OwnerClubDetailGate";
import { getAllOwnerClubIds } from "@/modules/owner/lib/owner-club-detail-data";

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
  const t = await getTranslations("OwnerClubDetail");
  return { title: `${t("pageTitle")} · ${clubId}` };
}

export default async function OwnerClubDetailPage({
  params,
}: OwnerClubDetailPageProps) {
  const { clubId } = await params;
  return <OwnerClubDetailGate clubId={clubId} />;
}
