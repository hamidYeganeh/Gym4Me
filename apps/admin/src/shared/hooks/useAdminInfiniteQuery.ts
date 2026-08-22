import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, paginationCount, type Paginated } from "@repo/api";

type UseAdminInfiniteQueryOptions<TItem> = {
  queryKey: string;
  pageSize?: number;
  enabled?: boolean;
  errorFallback: string;
  fetchPage: (page: number, pageSize: number) => Promise<Paginated<TItem>>;
};

/** @deprecated Prefer `useAdminPaginatedQuery` for admin list screens. */
export function useAdminInfiniteQuery<TItem>({
  queryKey,
  pageSize = 20,
  enabled = true,
  errorFallback,
  fetchPage,
}: UseAdminInfiniteQueryOptions<TItem>) {
  const [items, setItems] = useState<TItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const hasMore = items.length < total;

  const loadPage = useCallback(
    async (nextPage: number, mode: "replace" | "append") => {
      const requestId = ++requestIdRef.current;
      if (mode === "replace") {
        setLoading(true);
        setError(null);
      } else {
        setFetchingMore(true);
      }

      try {
        const result = await fetchPage(nextPage, pageSize);
        if (requestId !== requestIdRef.current) return;
        setTotal(paginationCount(result.pagination));
        setPage(nextPage);
        setItems((current) =>
          mode === "replace"
            ? result.result
            : [...current, ...result.result],
        );
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        const message =
          err instanceof ApiError
            ? err.message || errorFallback
            : errorFallback;
        setError(message);
        if (mode === "replace") {
          setItems([]);
          setTotal(0);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setFetchingMore(false);
        }
      }
    },
    [errorFallback, fetchPage, pageSize],
  );

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void loadPage(1, "replace");
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, loadPage, queryKey]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading || fetchingMore) return;
    void loadPage(page + 1, "append");
  }, [fetchingMore, hasMore, loadPage, loading, page]);

  const reload = useCallback(() => {
    void loadPage(1, "replace");
  }, [loadPage]);

  return {
    items,
    total,
    loading,
    fetchingMore,
    hasMore,
    error,
    loadMore,
    reload,
  };
}
