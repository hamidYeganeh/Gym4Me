import type { BrowseClass } from "../../lib/classes-browse-data";
import type {
  ClassCategoryFilter,
  ClassCategoryFilterId,
} from "../../lib/classes-browse-data";

export type DiscoveryClassesScreenProps = {
  classes: BrowseClass[];
  filters: ClassCategoryFilter[];
  activeFilter: ClassCategoryFilterId;
  onFilterChange: (id: ClassCategoryFilterId) => void;
  isLoading?: boolean;
  isError?: boolean;
  isStale?: boolean;
  onRetry?: () => void;
};
