import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  DEFAULT_SELECTED_COACH_ID,
  MAP_COACHES,
} from "@/modules/discovery/lib/map-data";
import { DiscoveryMapScreen } from "@/modules/discovery/screens/DiscoveryMapScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("DiscoveryMap");
  return { title: t("pageTitle") };
}

export default function DiscoveryMapPage() {
  return (
    <DiscoveryMapScreen
      coaches={MAP_COACHES}
      initialSelectedId={DEFAULT_SELECTED_COACH_ID}
    />
  );
}
