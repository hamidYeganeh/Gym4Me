"use client";

import { useSearchParams } from "next/navigation";
import { useDiscoveryClassesBrowse } from "../../lib/use-discovery-classes-browse";
import { DiscoveryClassesScreen } from "./DiscoveryClassesScreen";

export function DiscoveryClassesScreenLoader() {
  const searchParams = useSearchParams();
  const browse = useDiscoveryClassesBrowse({
    category: searchParams.get("category"),
    clubId: searchParams.get("clubId"),
    sportId: searchParams.get("sportId"),
  });

  return (
    <DiscoveryClassesScreen
      activeFilter={browse.activeFilter}
      classes={browse.classes}
      filters={browse.filters}
      isError={browse.isError}
      isLoading={browse.isLoading}
      isStale={browse.isStale}
      onFilterChange={browse.setActiveFilter}
      onRetry={browse.retry}
    />
  );
}
