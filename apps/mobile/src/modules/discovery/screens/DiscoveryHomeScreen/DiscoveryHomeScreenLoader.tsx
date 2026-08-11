"use client";

import { ClubCardSkeleton } from "@repo/ui/cards/ClubCard";
import { CoachExpertCardSkeleton } from "@repo/ui/cards/CoachExpertCard";
import { SportCategoryCardSkeleton } from "@repo/ui/cards/SportCategoryCard";
import { useDiscoveryHome } from "../../lib/use-discovery-home";
import { usePlacementBanners } from "../../lib/use-placement-banners";
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
  const banners = usePlacementBanners("discovery_home");

  if (
    home.isLoading &&
    home.nearbyClubs.length === 0 &&
    home.topClubs.length === 0
  ) {
    return <DiscoveryHomePageSkeleton />;
  }

  return (
    <DiscoveryHomeScreen
      amenities={home.amenities}
      articles={home.articles}
      banners={banners.slides}
      cities={home.cities}
      classes={home.classes}
      coachCityName={home.coachCityName}
      coaches={home.coaches}
      features={home.features}
      galleryItems={home.galleryItems}
      isLoading={home.isLoading}
      nearbyClubs={home.nearbyClubs}
      open24Clubs={home.open24Clubs}
      sports={home.sports}
      topClubs={home.topClubs}
    />
  );
}
