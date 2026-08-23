import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OwnerClubDetailGate } from "@/modules/owner/lib/OwnerClubDetailGate";
import { getAllOwnerClubIds } from "@/modules/owner/lib/owner-club-detail-data";
import {
  buildDemoStaticParams,
  canUseDemoFixtureId,
  STATIC_EXPORT_PLACEHOLDER_ID,
} from "@/shared/lib/runtime-mode";

type OwnerClubDetailPageProps = {
  params: Promise<{ clubId: string }>;
};

export function generateStaticParams() {
  return buildDemoStaticParams(
    () => getAllOwnerClubIds().map((clubId) => ({ clubId })),
    [{ clubId: STATIC_EXPORT_PLACEHOLDER_ID }],
  );
}

export async function generateMetadata({
  params,
}: OwnerClubDetailPageProps): Promise<Metadata> {
  const { clubId } = await params;
  const t = await getTranslations("OwnerClubDetail");
  return {
    title: canUseDemoFixtureId(clubId)
      ? `${t("pageTitle")} · ${clubId}`
      : t("pageTitle"),
  };
}

export default async function OwnerClubDetailPage({
  params,
}: OwnerClubDetailPageProps) {
  const { clubId } = await params;
  return <OwnerClubDetailGate clubId={clubId} />;
}
