import type { DiscoveryActionButtonVariant } from "@repo/api/discovery";
import type { HomeSportCategoryItem } from "../../lib/sports-home";

export type DiscoveryHomeSportCategoriesSectionProps = {
  categories: HomeSportCategoryItem[];
  isLoading?: boolean;
  title?: string;
  hint?: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  seeAllVariant?: DiscoveryActionButtonVariant;
};
