import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DiscoveryMapScreenDynamic } from "@/modules/discovery/screens/DiscoveryMapScreen/DiscoveryMapScreenDynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("DiscoveryMap");
  return { title: t("title") };
}

export default function DiscoveryMapPage() {
  return <DiscoveryMapScreenDynamic />;
}
