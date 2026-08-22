import type { ArticleKindFilterId, BrowseArticle } from "../../lib/articles-browse";

export type DiscoveryArticlesScreenProps = {
  articles: BrowseArticle[];
  total: number;
  activeKind: ArticleKindFilterId;
  onKindChange: (kind: ArticleKindFilterId) => void;
  isLoading?: boolean;
  isFetchingMore?: boolean;
  hasMore?: boolean;
  error?: string | null;
  onLoadMore: () => void;
  onRetry: () => void;
};
