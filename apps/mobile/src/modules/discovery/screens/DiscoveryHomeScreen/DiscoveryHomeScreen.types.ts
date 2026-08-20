import type { BrowseClub } from "../../lib/clubs-browse-data";
import type { FeaturedCoach } from "../../lib/coaches-browse-data";
import type { PlacementBannerSlide } from "../../lib/use-placement-banners";
import type {
  HomeAmenityItem,
  HomeEquipmentItem,
  HomeFeatureItem,
  HomeGalleryItem,
  HomeLocationItem,
  HomeSportItem,
} from "../../lib/home-browse-data";

export type DiscoveryHomeScreenProps = {
  banners?: PlacementBannerSlide[];
  features: HomeFeatureItem[];
  cities: HomeLocationItem[];
  nearbyClubs: BrowseClub[];
  topClubs: BrowseClub[];
  open24Clubs: BrowseClub[];
  coaches: FeaturedCoach[];
  coachCityName: string;
  amenities: HomeAmenityItem[];
  equipment: HomeEquipmentItem[];
  sports: HomeSportItem[];
  galleryItems: HomeGalleryItem[];
};
