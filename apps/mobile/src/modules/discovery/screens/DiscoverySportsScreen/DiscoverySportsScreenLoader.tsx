"use client";

import { useSearchParams } from "next/navigation";
import { useDiscoverySportsBrowse } from "../../lib/use-discovery-sports-browse";
import { DiscoverySportsScreen } from "./DiscoverySportsScreen";

export function DiscoverySportsScreenLoader() {
  const searchParams = useSearchParams();
  const browse = useDiscoverySportsBrowse({
    category: searchParams.get("category"),
  });

  return (
    <DiscoverySportsScreen
      activeFilter={browse.activeFilter}
      filters={browse.filters}
      isError={browse.isError}
      isLoading={browse.isLoading}
      isStale={browse.isStale}
      onFilterChange={browse.setActiveFilter}
      onRetry={browse.retry}
      sports={browse.sports}
    />
  );
}
