"use client";

import { useSearchParams } from "next/navigation";
import { useDiscoveryCoachesBrowse } from "../../lib/use-discovery-coaches-browse";
import { DiscoveryCoachesScreen } from "./DiscoveryCoachesScreen";

export function DiscoveryCoachesScreenLoader() {
  const searchParams = useSearchParams();
  const browse = useDiscoveryCoachesBrowse({
    specialtyKey: searchParams.get("specialtyKey"),
    cityId: searchParams.get("cityId"),
    availability: searchParams.get("availability"),
    verified: searchParams.get("verified"),
    fresh: searchParams.get("fresh"),
  });

  return (
    <DiscoveryCoachesScreen
      activeFilter={browse.activeFilter}
      cities={browse.cities}
      coaches={browse.coaches}
      discoveryFilters={browse.filters}
      districts={browse.districts}
      isLoading={browse.isLoading}
      onFilterChange={browse.setActiveFilter}
      provinces={browse.provinces}
    />
  );
}
