import type { BrowseClub } from "../../lib/clubs-browse-data";
import type { PopularCoach } from "../../lib/coaches-browse-data";
import type {
  HomeClassItem,
  HomeLocationItem,
  HomeSportItem,
} from "../../lib/home-browse-data";

export type DiscoveryHomeScreenProps = {
  provinces: HomeLocationItem[];
  cities: HomeLocationItem[];
  sportCategories: HomeSportItem[];
  sports: HomeSportItem[];
  featuredClubs: BrowseClub[];
  popularCoaches: PopularCoach[];
  featuredClasses: HomeClassItem[];
  isLoading?: boolean;
};
