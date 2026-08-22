"use client";

import { useDiscoveryHomeArticles } from "../../lib/use-discovery-home-articles";
import { useDiscoveryHomeCategories } from "../../lib/use-discovery-home-categories";
import { useDiscoveryHomeCities } from "../../lib/use-discovery-home-cities";
import { useDiscoveryHomeDistrictClubs } from "../../lib/use-discovery-home-district-clubs";
import { useDiscoveryHomeNearbyClubs } from "../../lib/use-discovery-home-nearby-clubs";
import { useDiscoveryHomeSportCategories } from "../../lib/use-discovery-home-sport-categories";
import { useDiscoveryHomeSports } from "../../lib/use-discovery-home-sports";
import { usePlacementBanners } from "../../lib/use-placement-banners";
import { DiscoveryHomeScreen } from "./DiscoveryHomeScreen";

export function DiscoveryHomeScreenLoader() {
  const banners = usePlacementBanners("discovery_home");
  const categories = useDiscoveryHomeCategories();
  const sportCategories = useDiscoveryHomeSportCategories();
  const sports = useDiscoveryHomeSports();
  const cities = useDiscoveryHomeCities();
  const nearby = useDiscoveryHomeNearbyClubs();
  const district = useDiscoveryHomeDistrictClubs();
  const articles = useDiscoveryHomeArticles();

  return (
    <DiscoveryHomeScreen
      banners={banners.slides}
      bannersLoading={banners.isLoading}
      categories={categories.categories}
      categoriesLoading={categories.isLoading}
      sportCategories={sportCategories.categories}
      sportCategoriesLoading={sportCategories.isLoading}
      sports={sports.sports}
      sportsLoading={sports.isLoading}
      cities={cities.cities}
      citiesLoading={cities.isLoading}
      nearbyClubs={nearby.clubs}
      nearbyClubsLoading={nearby.isLoading}
      districtClubs={district.clubs}
      districtClubsLoading={district.isLoading}
      districtName={district.areaName}
      districtLocationId={district.locationId}
      articles={articles.articles}
      articlesLoading={articles.isLoading}
    />
  );
}
