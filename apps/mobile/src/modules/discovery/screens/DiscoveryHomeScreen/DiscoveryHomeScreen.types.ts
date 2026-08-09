import type { BrowseClub } from "../../lib/clubs-browse-data";
import type { FeaturedCoach } from "../../lib/coaches-browse-data";
import type {
  HomeAmenityItem,
  HomeArticleItem,
  HomeClassItem,
  HomeFeatureItem,
  HomeGalleryItem,
  HomeLocationItem,
  HomeSportItem,
} from "../../lib/home-browse-data";

export type DiscoveryHomeScreenProps = {
  features: HomeFeatureItem[];
  cities: HomeLocationItem[];
  nearbyClubs: BrowseClub[];
  topClubs: BrowseClub[];
  open24Clubs: BrowseClub[];
  coaches: FeaturedCoach[];
  coachCityName: string;
  classes: HomeClassItem[];
  amenities: HomeAmenityItem[];
  sports: HomeSportItem[];
  articles: HomeArticleItem[];
  galleryItems: HomeGalleryItem[];
  isLoading?: boolean;
};
