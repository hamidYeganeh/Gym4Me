import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { DiscoveryArticlesScreenLoader } from "@/modules/discovery/screens/DiscoveryArticlesScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("DiscoveryArticles");
  return { title: t("pageTitle") };
}

export default function DiscoveryArticlesPage() {
  return (
    <Suspense fallback={null}>
      <DiscoveryArticlesScreenLoader />
    </Suspense>
  );
}
