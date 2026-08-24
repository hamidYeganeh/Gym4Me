import type { HomeSportCategoryItem } from "../../lib/sports-home";

export type DiscoveryHomeSportCategoriesSectionProps = {
  categories: HomeSportCategoryItem[];
  isLoading?: boolean;
  title?: string;
  hint?: string;
  seeAllHref?: string;
};
