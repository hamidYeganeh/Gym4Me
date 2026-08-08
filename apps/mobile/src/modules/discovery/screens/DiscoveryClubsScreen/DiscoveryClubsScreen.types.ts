import type { BrowseClub } from "../../lib/clubs-browse-data";
import type {
  ClubDiscoveryFilter,
  ClubDiscoveryFilterId,
} from "../../lib/club-discovery-filters";
import type { HomeLocationItem } from "../../lib/home-browse-data";

export type DiscoveryClubsScreenProps = {
  clubs: BrowseClub[];
  discoveryFilters: ClubDiscoveryFilter[];
  activeFilter: ClubDiscoveryFilterId;
  onFilterChange: (id: ClubDiscoveryFilterId) => void;
  provinces: HomeLocationItem[];
  cities: HomeLocationItem[];
  districts: HomeLocationItem[];
  isLoading?: boolean;
};
