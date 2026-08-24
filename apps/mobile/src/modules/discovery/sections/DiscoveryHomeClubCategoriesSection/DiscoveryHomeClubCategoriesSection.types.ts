import type { HomeClubCategoryItem } from "../../lib/club-categories-home";

export type DiscoveryHomeClubCategoriesSectionProps = {
  categories: HomeClubCategoryItem[];
  isLoading?: boolean;
  title?: string;
  hint?: string;
  tone?: "surface" | "warning" | "accent" | "muted";
  pattern?: boolean;
};
