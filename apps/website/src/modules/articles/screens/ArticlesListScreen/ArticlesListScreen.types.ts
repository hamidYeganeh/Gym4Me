import type { ArticleFacets, ArticleSummary } from "@repo/api";

export type ArticlesListScreenProps = {
  posts: ArticleSummary[];
  facets: ArticleFacets;
  activeKind?: string;
  activeCategory?: string;
  /** `any` = no audience filter; `all` = taxonomy audience "everyone". */
  activeAudience?: string;
};
