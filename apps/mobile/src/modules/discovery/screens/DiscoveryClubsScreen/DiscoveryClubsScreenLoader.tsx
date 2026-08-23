"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "@/shared/lib/app-router";

import {
  clubsNearby,
  clubsOpenNow,
  sortClubsByRating,
} from "../../lib/clubs-browse-data";
import { useDiscoveryClubsBrowse } from "../../lib/use-discovery-clubs-browse";
import { useDiscoveryClassesBrowse } from "../../lib/use-discovery-classes-browse";
import { useDiscoveryHomeArticles } from "../../lib/use-discovery-home-articles";
import { useDiscoveryHomeCategories } from "../../lib/use-discovery-home-categories";
import { useDiscoveryHomeCities } from "../../lib/use-discovery-home-cities";
import { useDiscoveryHomeDistrictClubs } from "../../lib/use-discovery-home-district-clubs";
import { useDiscoveryHomeNearbyClubs } from "../../lib/use-discovery-home-nearby-clubs";
import { useDiscoveryHomeSportCategories } from "../../lib/use-discovery-home-sport-categories";
import { useDiscoveryHomeSports } from "../../lib/use-discovery-home-sports";
import { usePlacementBanners } from "../../lib/use-placement-banners";
import { DiscoveryClubsScreen } from "./DiscoveryClubsScreen";

export function DiscoveryClubsScreenLoader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationId = searchParams.get("locationId");
  const sportId = searchParams.get("sportId");
  const categoryId = searchParams.get("categoryId");
  const genderPolicy = searchParams.get("genderPolicy");
  const amenitySlug = searchParams.get("amenitySlug");
  const accessibility = searchParams.get("accessibility");
  const ageGroupKey = searchParams.get("ageGroupKey");
  const levelKey = searchParams.get("levelKey");
  const hasScopeFilter = Boolean(
    locationId ||
    sportId ||
    categoryId ||
    genderPolicy ||
    amenitySlug ||
    accessibility ||
    ageGroupKey ||
    levelKey,
  );

  const banners = usePlacementBanners("discovery_clubs");
  const categories = useDiscoveryHomeCategories();
  const sportCategories = useDiscoveryHomeSportCategories();
  const sports = useDiscoveryHomeSports();
  const cities = useDiscoveryHomeCities();
  const nearby = useDiscoveryHomeNearbyClubs();
  const district = useDiscoveryHomeDistrictClubs();
  const articles = useDiscoveryHomeArticles();
  const classes = useDiscoveryClassesBrowse();
  const browse = useDiscoveryClubsBrowse({
    locationId,
    sportId,
    categoryId,
    genderPolicy,
    amenitySlug,
    accessibility,
    ageGroupKey,
    levelKey,
  });

  const scopedClubs = browse.clubs;
  const nearbyClubs = hasScopeFilter
    ? clubsNearby(scopedClubs).slice(0, 8)
    : nearby.clubs;
  const nearbyClubsLoading = hasScopeFilter
    ? browse.isLoading
    : nearby.isLoading;

  return (
    <DiscoveryClubsScreen
      articles={articles.articles}
      articlesLoading={articles.isLoading}
      classes={classes.classes.slice(0, 10)}
      classesLoading={classes.isLoading}
      banners={banners.slides}
      bannersLoading={banners.isLoading}
      categories={categories.categories}
      categoriesLoading={categories.isLoading}
      cities={cities.cities}
      citiesLoading={cities.isLoading}
      clubsCount={scopedClubs.length}
      clubsError={browse.isError}
      clubsLoading={browse.isLoading}
      districtClubs={district.clubs}
      districtClubsLoading={district.isLoading}
      districtLocationId={district.locationId}
      districtName={district.areaName}
      hideDistrictRail={Boolean(locationId)}
      nearbyClubs={nearbyClubs}
      nearbyClubsLoading={nearbyClubsLoading}
      onClearFilters={() => router.push("/discovery/clubs")}
      onClubsRetry={browse.retry}
      openNowClubs={clubsOpenNow(scopedClubs).slice(0, 8)}
      sportCategories={sportCategories.categories}
      sportCategoriesLoading={sportCategories.isLoading}
      sports={sports.sports}
      sportsLoading={sports.isLoading}
      topRatedClubs={sortClubsByRating(scopedClubs).slice(0, 8)}
    />
  );
}
