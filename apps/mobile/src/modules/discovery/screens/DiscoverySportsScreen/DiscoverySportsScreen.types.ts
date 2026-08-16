import type {
  BrowseSport,
  SportCategoryFilter,
  SportCategoryFilterId,
} from "../../lib/sports-browse-data";

export type DiscoverySportsScreenProps = {
  sports: BrowseSport[];
  filters: SportCategoryFilter[];
  activeFilter: SportCategoryFilterId;
  onFilterChange: (id: SportCategoryFilterId) => void;
  isLoading?: boolean;
};
