import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OwnerClubsGate } from "@/modules/owner/lib/OwnerClubsGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnerClubs");
  return { title: t("pageTitle") };
}

export default function OwnerClubsPage() {
  return <OwnerClubsGate />;
}
