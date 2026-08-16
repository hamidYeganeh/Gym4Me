"use client";

import { SportCategoryCardSkeleton } from "@repo/ui/cards/SportCategoryCard";
import { useSearchParams } from "next/navigation";
import { useDiscoverySportsBrowse } from "../../lib/use-discovery-sports-browse";
import { DiscoverySportsScreen } from "./DiscoverySportsScreen";

function DiscoverySportsPageSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="grid grid-cols-2 gap-3 px-screen py-6"
      role="status"
    >
      <SportCategoryCardSkeleton />
      <SportCategoryCardSkeleton />
      <SportCategoryCardSkeleton />
      <SportCategoryCardSkeleton />
    </div>
  );
}

export function DiscoverySportsScreenLoader() {
  const searchParams = useSearchParams();
  const browse = useDiscoverySportsBrowse({
    category: searchParams.get("category"),
  });

  if (browse.isLoading && browse.sports.length === 0) {
    return <DiscoverySportsPageSkeleton />;
  }

  return (
    <DiscoverySportsScreen
      activeFilter={browse.activeFilter}
      filters={browse.filters}
      isLoading={browse.isLoading}
      onFilterChange={browse.setActiveFilter}
      sports={browse.sports}
    />
  );
}
