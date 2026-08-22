"use client";

import { useSearchParams } from "next/navigation";
import { useDiscoveryArticlesBrowse } from "../../lib/use-discovery-articles-browse";
import { DiscoveryArticlesScreen } from "./DiscoveryArticlesScreen";

export function DiscoveryArticlesScreenLoader() {
  const searchParams = useSearchParams();
  const browse = useDiscoveryArticlesBrowse({
    kind: searchParams.get("kind"),
  });

  return (
    <DiscoveryArticlesScreen
      activeKind={browse.activeKind}
      articles={browse.articles}
      error={browse.error}
      hasMore={browse.hasMore}
      isFetchingMore={browse.isFetchingMore}
      isLoading={browse.isLoading}
      onKindChange={browse.setActiveKind}
      onLoadMore={browse.loadMore}
      onRetry={browse.reload}
      total={browse.total}
    />
  );
}
