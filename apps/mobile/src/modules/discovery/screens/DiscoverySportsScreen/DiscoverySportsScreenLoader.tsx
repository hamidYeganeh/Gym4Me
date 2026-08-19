"use client";

import { SportCardSkeleton } from "@repo/ui/cards/SportCard";
import { useSearchParams } from "next/navigation";
import { useDiscoverySportsBrowse } from "../../lib/use-discovery-sports-browse";
import { DiscoverySportsScreen } from "./DiscoverySportsScreen";

function DiscoverySportsPageSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="mx-auto grid w-full max-w-lg grid-cols-2 gap-2 px-screen py-6"
      role="status"
    >
      <SportCardSkeleton
        className="col-span-2 !h-[14rem] !w-full !rounded-[1.35rem]"
        size="sm"
      />
      <SportCardSkeleton
        className="!h-[14rem] !w-full !rounded-[1.35rem]"
        size="sm"
      />
      <SportCardSkeleton
        className="!h-[14rem] !w-full !rounded-[1.35rem]"
        size="sm"
      />
      <SportCardSkeleton
        className="!h-[14rem] !w-full !rounded-[1.35rem]"
        size="sm"
      />
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
