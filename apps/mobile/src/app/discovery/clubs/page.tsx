import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { DiscoveryClubsScreenLoader } from "@/modules/discovery/screens/DiscoveryClubsScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("DiscoveryClubs");
  return { title: t("pageTitle") };
}

export default function DiscoveryClubsPage() {
  return (
    <Suspense fallback={null}>
      <DiscoveryClubsScreenLoader />
    </Suspense>
  );
}
