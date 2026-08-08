"use client";

import { ClubCardSkeleton } from "@repo/ui/cards/ClubCard";
import { CoachExpertCardSkeleton } from "@repo/ui/cards/CoachExpertCard";
import { SportCategoryCardSkeleton } from "@repo/ui/cards/SportCategoryCard";
import { useDiscoveryHome } from "../../lib/use-discovery-home";
import { DiscoveryHomeScreen } from "./DiscoveryHomeScreen";

function DiscoveryHomePageSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="flex flex-col gap-6 px-screen py-6"
      role="status"
    >
      <div className="flex gap-3 overflow-hidden">
        <SportCategoryCardSkeleton className="shrink-0" size="md" />
        <SportCategoryCardSkeleton className="shrink-0" size="md" />
      </div>
      <ClubCardSkeleton orientation="fullWidth" />
      <div className="flex gap-3 overflow-hidden">
        <CoachExpertCardSkeleton className="shrink-0" />
        <CoachExpertCardSkeleton className="shrink-0" />
        <CoachExpertCardSkeleton className="shrink-0" />
        <CoachExpertCardSkeleton className="shrink-0" />
      </div>
      <div className="flex gap-3 overflow-hidden">
        <ClubCardSkeleton
          className="w-[min(17.5rem,78vw)] shrink-0"
          orientation="vertical"
        />
        <ClubCardSkeleton
          className="w-[min(17.5rem,78vw)] shrink-0"
          orientation="vertical"
        />
      </div>
    </div>
  );
}

export function DiscoveryHomeScreenLoader() {
  const home = useDiscoveryHome();

  if (home.isLoading && home.clubs.length === 0) {
    return <DiscoveryHomePageSkeleton />;
  }

  return (
    <DiscoveryHomeScreen
      featuredClasses={home.classes}
      featuredClubs={home.clubs}
      isLoading={home.isLoading}
      popularCoaches={home.coaches}
      provinces={home.provinces}
      cities={home.cities}
      sportCategories={home.sportCategories}
      sports={home.sports}
    />
  );
}
