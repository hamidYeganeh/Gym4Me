import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DiscoverySearchScreen } from "@/modules/discovery/screens/DiscoverySearchScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("DiscoverySearch");
  return { title: t("pageTitle") };
}

export default function DiscoverySearchPage() {
  return <DiscoverySearchScreen />;
}
