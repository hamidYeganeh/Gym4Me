import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

type UseAdminListQueryParamsOptions<TFilters extends Record<string, string>> = {
  filterKeys: ReadonlyArray<keyof TFilters & string>;
  defaults?: Partial<{ search: string } & TFilters>;
  debounceMs?: number;
};

function readParam(
  searchParams: URLSearchParams,
  key: string,
  fallback = "",
): string {
  return searchParams.get(key) ?? fallback;
}

export function useAdminListQueryParams<
  TFilters extends Record<string, string>,
>({
  filterKeys,
  defaults,
  debounceMs = 350,
}: UseAdminListQueryParamsOptions<TFilters>) {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = readParam(searchParams, "search", defaults?.search ?? "");
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setSearchInput(search);
    });
    return () => {
      cancelled = true;
    };
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = searchInput.trim();
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current);
          if (next) params.set("search", next);
          else params.delete("search");
          return params;
        },
        { replace: true },
      );
    }, debounceMs);
    return () => window.clearTimeout(timer);
  }, [searchInput, debounceMs, setSearchParams]);

  const filters = useMemo(() => {
    const next = {} as TFilters;
    for (const key of filterKeys) {
      const fallback = String(defaults?.[key] ?? "all");
      next[key] = readParam(searchParams, key, fallback) as TFilters[typeof key];
    }
    return next;
    // defaults are treated as initial config; callers should pass stable values
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKeys, searchParams]);

  const setFilter = <K extends keyof TFilters & string>(
    key: K,
    value: TFilters[K],
  ) => {
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current);
        const fallback = String(defaults?.[key] ?? "all");
        if (!value || value === fallback) params.delete(key);
        else params.set(key, String(value));
        return params;
      },
      { replace: true },
    );
  };

  const resetFilters = () => {
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current);
        params.delete("search");
        for (const key of filterKeys) params.delete(key);
        return params;
      },
      { replace: true },
    );
    setSearchInput("");
  };

  return {
    search,
    searchInput,
    setSearchInput,
    filters,
    setFilter,
    resetFilters,
  };
}
