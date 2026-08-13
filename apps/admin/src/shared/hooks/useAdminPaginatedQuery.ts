import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, type Paginated } from "@repo/api";

type UseAdminPaginatedQueryOptions<TItem> = {
  queryKey: string;
  pageSize?: number;
  enabled?: boolean;
  errorFallback: string;
  fetchPage: (page: number, pageSize: number) => Promise<Paginated<TItem>>;
};

export function useAdminPaginatedQuery<TItem>({
  queryKey,
  pageSize = 20,
  enabled = true,
  errorFallback,
  fetchPage,
}: UseAdminPaginatedQueryOptions<TItem>) {
  const [items, setItems] = useState<TItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const previousQueryKeyRef = useRef(queryKey);

  const loadPage = useCallback(
    async (nextPage: number) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError(null);

      try {
        const result = await fetchPage(nextPage, pageSize);
        if (requestId !== requestIdRef.current) return;
        setItems(result.result);
        setTotal(result.pagination.total);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setItems([]);
        setTotal(0);
        setError(
          err instanceof ApiError
            ? err.message || errorFallback
            : errorFallback,
        );
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    },
    [errorFallback, fetchPage, pageSize],
  );

  useEffect(() => {
    if (!enabled) return;
    const queryChanged = previousQueryKeyRef.current !== queryKey;
    previousQueryKeyRef.current = queryKey;
    if (queryChanged && page !== 1) {
      setPage(1);
      return;
    }
    void loadPage(page);
  }, [enabled, loadPage, page, queryKey]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const changePage = useCallback(
    (nextPage: number) => {
      setPage(Math.min(totalPages, Math.max(1, nextPage)));
    },
    [totalPages],
  );

  const reload = useCallback(() => {
    void loadPage(page);
  }, [loadPage, page]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
    loading,
    error,
    setPage: changePage,
    reload,
  };
}
