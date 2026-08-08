import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DiscoveryMapScreenLoader } from "@/modules/discovery/screens/DiscoveryMapScreen/DiscoveryMapScreenLoader";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("DiscoveryMap");
  return { title: t("pageTitle") };
}

export default function DiscoveryMapPage() {
  return <DiscoveryMapScreenLoader />;
}
