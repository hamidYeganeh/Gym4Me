import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OwnerClubsCreateScreen } from "@/modules/owner/screens/OwnerClubsCreateScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.ClubCreate");
  return { title: t("title") };
}

export default function OwnerClubsCreatePage() {
  return <OwnerClubsCreateScreen />;
}
