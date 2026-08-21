import type { PlacementBannerSlide } from "../../lib/use-placement-banners";
import type {
  HomeAmenityItem,
  HomeGalleryItem,
  HomeLocationItem,
  HomeSportItem,
} from "../../lib/home-browse-data";

export type DiscoveryHomeScreenProps = {
  banners?: PlacementBannerSlide[];
  cities: HomeLocationItem[];
  coachCityName: string;
  amenities: HomeAmenityItem[];
  sports: HomeSportItem[];
  galleryItems: HomeGalleryItem[];
};
