import type { HomeEditorialArticle } from "../../lib/articles-home";
import type { HomeClubCategoryItem } from "../../lib/club-categories-home";
import type { BrowseClub } from "../../lib/clubs-browse-data";
import type { HomeLocationItem, HomeSportItem } from "../../lib/home-browse-data";
import type { HomeSportCategoryItem } from "../../lib/sports-home";
import type { PlacementBannerSlide } from "../../lib/use-placement-banners";

export type DiscoveryHomeScreenProps = {
  banners?: PlacementBannerSlide[];
  bannersLoading?: boolean;
  categories?: HomeClubCategoryItem[];
  categoriesLoading?: boolean;
  sportCategories?: HomeSportCategoryItem[];
  sportCategoriesLoading?: boolean;
  sports?: HomeSportItem[];
  sportsLoading?: boolean;
  cities?: HomeLocationItem[];
  citiesLoading?: boolean;
  nearbyClubs?: BrowseClub[];
  nearbyClubsLoading?: boolean;
  districtClubs?: BrowseClub[];
  districtClubsLoading?: boolean;
  districtName?: string | null;
  districtLocationId?: string | null;
  articles?: HomeEditorialArticle[];
  articlesLoading?: boolean;
};
