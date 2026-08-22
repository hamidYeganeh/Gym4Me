import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

type AdminListFilterValue = string | readonly string[];

export type AdminListSort = {
  column: string;
  direction: "ascending" | "descending";
};

type UseAdminListQueryParamsOptions<
  TFilters extends Record<string, AdminListFilterValue>,
  TSortBy extends string = string,
> = {
  filterKeys: ReadonlyArray<keyof TFilters & string>;
  defaults?: Partial<{ search: string; page: number; page_size: number } & TFilters>;
  defaultSort?: { column: TSortBy; direction: AdminListSort["direction"] };
  debounceMs?: number;
  /** When true, sync `page` and `page_size` to the URL. Default true. */
  syncPagination?: boolean;
};

function readParam(
  searchParams: URLSearchParams,
  key: string,
  fallback = "",
): string {
  return searchParams.get(key) ?? fallback;
}

function readPositiveInt(
  searchParams: URLSearchParams,
  key: string,
  fallback: number,
): number {
  const raw = searchParams.get(key);
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function useAdminListQueryParams<
  TFilters extends Record<string, AdminListFilterValue>,
  TSortBy extends string = string,
>({
  filterKeys,
  defaults,
  defaultSort,
  debounceMs = 350,
  syncPagination = true,
}: UseAdminListQueryParamsOptions<TFilters, TSortBy>) {
  const [searchParams, setSearchParams] = useSearchParams();

  const defaultPage = defaults?.page ?? 1;
  const defaultPageSize = defaults?.page_size ?? 20;

  const search = readParam(searchParams, "search", defaults?.search ?? "");
  const [searchInput, setSearchInput] = useState(search);

  const page = syncPagination
    ? readPositiveInt(searchParams, "page", defaultPage)
    : defaultPage;
  const pageSize = syncPagination
    ? readPositiveInt(searchParams, "page_size", defaultPageSize)
    : defaultPageSize;

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
          const prev = params.get("search") ?? "";
          if (next === prev) return current;
          if (next) params.set("search", next);
          else params.delete("search");
          if (syncPagination) params.delete("page");
          return params;
        },
        { replace: true },
      );
    }, debounceMs);
    return () => window.clearTimeout(timer);
  }, [searchInput, debounceMs, setSearchParams, syncPagination]);

  const filters = useMemo(() => {
    const next = {} as TFilters;
    for (const key of filterKeys) {
      const configuredDefault = defaults?.[key];
      if (Array.isArray(configuredDefault)) {
        const value = readParam(searchParams, key);
        next[key] = (
          value ? value.split(",").filter(Boolean) : [...configuredDefault]
        ) as unknown as TFilters[typeof key];
      } else {
        const fallback = String(configuredDefault ?? "all");
        next[key] = readParam(
          searchParams,
          key,
          fallback,
        ) as TFilters[typeof key];
      }
    }
    return next;
  }, [filterKeys, searchParams]);

  const setFilter = <K extends keyof TFilters & string>(
    key: K,
    value: TFilters[K],
  ) => {
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current);
        const configuredDefault = defaults?.[key];
        const serialized = Array.isArray(value)
          ? value.join(",")
          : String(value ?? "");
        const fallback = Array.isArray(configuredDefault)
          ? configuredDefault.join(",")
          : String(configuredDefault ?? "all");
        if (!serialized || serialized === fallback) params.delete(key);
        else params.set(key, serialized);
        if (syncPagination) params.delete("page");
        return params;
      },
      { replace: true },
    );
  };

  const setPage = (nextPage: number) => {
    if (!syncPagination) return;
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current);
        const safe = Math.max(1, Math.floor(nextPage) || 1);
        if (safe === defaultPage) params.delete("page");
        else params.set("page", String(safe));
        return params;
      },
      { replace: true },
    );
  };

  const setPageSize = (nextSize: number) => {
    if (!syncPagination) return;
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current);
        const safe = Math.max(1, Math.floor(nextSize) || defaultPageSize);
        if (safe === defaultPageSize) params.delete("page_size");
        else params.set("page_size", String(safe));
        params.delete("page");
        return params;
      },
      { replace: true },
    );
  };

  const sortBy = (readParam(
    searchParams,
    "sortBy",
    defaultSort?.column ?? "",
  ) || undefined) as TSortBy | undefined;
  const sortOrder = readParam(
    searchParams,
    "sortOrder",
    defaultSort?.direction === "ascending" ? "asc" : "desc",
  ) as "asc" | "desc";
  const sort: AdminListSort | undefined = sortBy
    ? {
        column: sortBy,
        direction: sortOrder === "desc" ? "descending" : "ascending",
      }
    : undefined;

  const setSort = (nextSort: AdminListSort) => {
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current);
        if (
          defaultSort &&
          nextSort.column === defaultSort.column &&
          nextSort.direction === defaultSort.direction
        ) {
          params.delete("sortBy");
          params.delete("sortOrder");
        } else {
          params.set("sortBy", nextSort.column);
          params.set(
            "sortOrder",
            nextSort.direction === "descending" ? "desc" : "asc",
          );
        }
        if (syncPagination) params.delete("page");
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
        params.delete("sortBy");
        params.delete("sortOrder");
        params.delete("page");
        params.delete("page_size");
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
    page,
    pageSize,
    setPage,
    setPageSize,
    sortBy,
    sortOrder,
    sort,
    setSort,
    resetFilters,
  };
}
