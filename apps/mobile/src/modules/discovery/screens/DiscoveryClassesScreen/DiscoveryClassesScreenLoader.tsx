"use client";

import { useSearchParams } from "next/navigation";
import { useDiscoveryClassesBrowse } from "../../lib/use-discovery-classes-browse";
import { DiscoveryClassesScreen } from "./DiscoveryClassesScreen";

function DiscoveryClassesPageSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="flex flex-col gap-4 px-screen py-6"
      role="status"
    >
      <div className="h-40 animate-pulse rounded-3xl bg-surface" />
      <div className="h-40 animate-pulse rounded-3xl bg-surface" />
      <div className="h-40 animate-pulse rounded-3xl bg-surface" />
    </div>
  );
}

export function DiscoveryClassesScreenLoader() {
  const searchParams = useSearchParams();
  const browse = useDiscoveryClassesBrowse({
    category: searchParams.get("category"),
    clubId: searchParams.get("clubId"),
    sportId: searchParams.get("sportId"),
  });

  if (browse.isLoading && browse.classes.length === 0) {
    return <DiscoveryClassesPageSkeleton />;
  }

  return (
    <DiscoveryClassesScreen
      activeFilter={browse.activeFilter}
      classes={browse.classes}
      filters={browse.filters}
      isLoading={browse.isLoading}
      onFilterChange={browse.setActiveFilter}
    />
  );
}
