import type { BrowseCoach } from "../../lib/coaches-browse-data";
import type {
  CoachDiscoveryFilter,
  CoachDiscoveryFilterId,
} from "../../lib/coach-discovery-filters";
import type { HomeLocationItem } from "../../lib/home-browse-data";

export type DiscoveryCoachesScreenProps = {
  coaches: BrowseCoach[];
  discoveryFilters: CoachDiscoveryFilter[];
  activeFilter: CoachDiscoveryFilterId;
  onFilterChange: (id: CoachDiscoveryFilterId) => void;
  provinces: HomeLocationItem[];
  cities: HomeLocationItem[];
  districts: HomeLocationItem[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
};
