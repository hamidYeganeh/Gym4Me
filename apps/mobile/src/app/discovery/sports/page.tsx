import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { DiscoverySportsScreenLoader } from "@/modules/discovery/screens/DiscoverySportsScreen/DiscoverySportsScreenLoader";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("DiscoverySports");
  return { title: t("pageTitle") };
}

export default function DiscoverySportsPage() {
  return (
    <Suspense fallback={null}>
      <DiscoverySportsScreenLoader />
    </Suspense>
  );
}
