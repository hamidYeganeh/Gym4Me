import type { HomeEditorialArticle } from "../../lib/articles-home";

export type DiscoveryHomeArticlesSectionProps = {
  articles: HomeEditorialArticle[];
  isLoading?: boolean;
  title?: string;
  hint?: string;
  seeAllHref?: string;
};
