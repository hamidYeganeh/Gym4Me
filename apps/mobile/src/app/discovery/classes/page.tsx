import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { DiscoveryClassesScreenLoader } from "@/modules/discovery/screens/DiscoveryClassesScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("DiscoveryClasses");
  return { title: t("pageTitle") };
}

export default function DiscoveryClassesPage() {
  return (
    <Suspense fallback={null}>
      <DiscoveryClassesScreenLoader />
    </Suspense>
  );
}
