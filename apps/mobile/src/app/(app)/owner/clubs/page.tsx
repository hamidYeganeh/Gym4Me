import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OWNER_CLUBS } from "@/modules/owner/lib/owner-clubs-data";
import { OwnerClubsScreen } from "@/modules/owner/screens/OwnerClubsScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnerClubs");
  return { title: t("pageTitle") };
}

export default function OwnerClubsPage() {
  return <OwnerClubsScreen clubs={OWNER_CLUBS} />;
}
