import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { DiscoveryCoachesScreenLoader } from "@/modules/discovery/screens/DiscoveryCoachesScreen/DiscoveryCoachesScreenLoader";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("DiscoveryCoaches");
  return { title: t("pageTitle") };
}

export default function DiscoveryCoachesPage() {
  return (
    <Suspense fallback={null}>
      <DiscoveryCoachesScreenLoader />
    </Suspense>
  );
}
