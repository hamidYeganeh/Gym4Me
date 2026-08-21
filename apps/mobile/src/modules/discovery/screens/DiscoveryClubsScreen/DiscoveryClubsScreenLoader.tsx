"use client";

import { useSearchParams } from "next/navigation";
import { useDiscoveryClubsBrowse } from "../../lib/use-discovery-clubs-browse";
import { DiscoveryClubsScreen } from "./DiscoveryClubsScreen";

export function DiscoveryClubsScreenLoader() {
  const searchParams = useSearchParams();
  const locationId = searchParams.get("locationId");
  const sportId = searchParams.get("sportId");
  const genderPolicy = searchParams.get("genderPolicy");
  const amenitySlug = searchParams.get("amenitySlug");
  const accessibility = searchParams.get("accessibility");
  const ageGroupKey = searchParams.get("ageGroupKey");
  const levelKey = searchParams.get("levelKey");
  const browse = useDiscoveryClubsBrowse({
    locationId,
    sportId,
    genderPolicy,
    amenitySlug,
    accessibility,
    ageGroupKey,
    levelKey,
  });

  return (
    <DiscoveryClubsScreen
      activeFilter={browse.activeFilter}
      cities={browse.cities}
      clubs={browse.clubs}
      discoveryFilters={browse.filters}
      districts={browse.districts}
      isLoading={browse.isLoading}
      onFilterChange={browse.setActiveFilter}
      provinces={browse.provinces}
    />
  );
}
