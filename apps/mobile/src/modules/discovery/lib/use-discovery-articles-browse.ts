"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, paginationCount } from "@repo/api";
import { articlesApi, mediaFileUrl } from "@/shared/lib/api";
import {
  ARTICLES_PAGE_SIZE,
  appendUniqueArticles,
  mapArticleToBrowseItem,
  nextArticlePage,
  resolveArticleKindParam,
  type ArticleKindFilterId,
  type BrowseArticle,
} from "./articles-browse";

export type DiscoveryArticlesBrowseOptions = {
  kind?: string | null;
};

export type DiscoveryArticlesBrowseState = {
  articles: BrowseArticle[];
  total: number;
  activeKind: ArticleKindFilterId;
  isLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  error: string | null;
  setActiveKind: (kind: ArticleKindFilterId) => void;
  loadMore: () => void;
  reload: () => void;
};

export function useDiscoveryArticlesBrowse(
  options: DiscoveryArticlesBrowseOptions = {},
): DiscoveryArticlesBrowseState {
  const initialKind = resolveArticleKindParam(options.kind);
  const [activeKind, setActiveKind] = useState<ArticleKindFilterId>(initialKind);
  const [articles, setArticles] = useState<BrowseArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    setActiveKind(initialKind);
  }, [initialKind]);

  const loadPage = useCallback(
    async (page: number, mode: "replace" | "append") => {
      const requestId = ++requestIdRef.current;
      if (mode === "replace") {
        setIsLoading(true);
        setError(null);
        setArticles([]);
        setTotal(0);
        setNextPage(null);
      } else {
        setIsFetchingMore(true);
      }

      try {
        const result = await articlesApi.list({
          page,
          page_size: ARTICLES_PAGE_SIZE,
          kind: activeKind === "all" ? undefined : activeKind,
        });
        if (requestId !== requestIdRef.current) return;

        const mapped = result.result.map((item) =>
          mapArticleToBrowseItem(
            item,
            mediaFileUrl(item.coverMediaId),
            mediaFileUrl(item.author.avatarMediaId),
          ),
        );
        setTotal(paginationCount(result.pagination));
        setNextPage(nextArticlePage(result.pagination));
        setArticles((current) =>
          mode === "replace"
            ? mapped
            : appendUniqueArticles(current, mapped),
        );
        setError(null);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        const message = err instanceof ApiError ? err.message : null;
        setError(message || "failed");
        if (mode === "replace") {
          setArticles([]);
          setTotal(0);
          setNextPage(null);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
          setIsFetchingMore(false);
        }
      }
    },
    [activeKind],
  );

  useEffect(() => {
    void loadPage(1, "replace");
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (nextPage == null || isLoading || isFetchingMore) return;
    void loadPage(nextPage, "append");
  }, [isFetchingMore, isLoading, loadPage, nextPage]);

  const reload = useCallback(() => {
    void loadPage(1, "replace");
  }, [loadPage]);

  return {
    articles,
    total,
    activeKind,
    isLoading,
    isFetchingMore,
    hasMore: nextPage != null,
    error,
    setActiveKind,
    loadMore,
    reload,
  };
}
