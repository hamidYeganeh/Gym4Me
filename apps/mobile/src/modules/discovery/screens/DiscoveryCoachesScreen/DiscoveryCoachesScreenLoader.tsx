"use client";

import { useSearchParams } from "next/navigation";
import { resolveCoachTypeParam } from "../../lib/coach-discovery-filters";
import { useDiscoveryCoachesBrowse } from "../../lib/use-discovery-coaches-browse";
import { DiscoveryCoachesScreen } from "./DiscoveryCoachesScreen";

export function DiscoveryCoachesScreenLoader() {
  const searchParams = useSearchParams();
  const browse = useDiscoveryCoachesBrowse({
    coachType: resolveCoachTypeParam(
      searchParams.get("coachType") ?? searchParams.get("specialtyKey"),
    ),
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
      isError={browse.isError}
      isLoading={browse.isLoading}
      onFilterChange={browse.setActiveFilter}
      onRetry={browse.retry}
      provinces={browse.provinces}
    />
  );
}
