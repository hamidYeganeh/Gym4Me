import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  COACH_SPECIALTIES,
  EXPERT_COACHES,
  FEATURED_COACHES,
  NEARBY_COACHES,
  POPULAR_COACHES,
} from "@/modules/discovery/lib/coaches-browse-data";
import { DiscoveryCoachesScreen } from "@/modules/discovery/screens/DiscoveryCoachesScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("DiscoveryCoaches");
  return { title: t("pageTitle") };
}

export default function DiscoveryCoachesPage() {
  return (
    <DiscoveryCoachesScreen
      expertCoaches={EXPERT_COACHES}
      featuredCoaches={FEATURED_COACHES}
      nearbyCoaches={NEARBY_COACHES}
      popularCoaches={POPULAR_COACHES}
      specialties={COACH_SPECIALTIES}
    />
  );
}
