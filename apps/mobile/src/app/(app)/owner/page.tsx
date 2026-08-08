import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  OWNER_HOME_CLUBS,
  OWNER_HOME_STATS,
} from "@/modules/owner/lib/owner-home-data";
import { OwnerHomeScreen } from "@/modules/owner/screens/OwnerHomeScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnerHome");
  return { title: t("title") };
}

export default function OwnerHomePage() {
  return (
    <OwnerHomeScreen clubs={OWNER_HOME_CLUBS} stats={OWNER_HOME_STATS} />
  );
}
