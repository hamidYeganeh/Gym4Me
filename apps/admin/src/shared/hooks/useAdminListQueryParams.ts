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
  defaults?: Partial<{ search: string } & TFilters>;
  defaultSort?: { column: TSortBy; direction: AdminListSort["direction"] };
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
  TFilters extends Record<string, AdminListFilterValue>,
  TSortBy extends string = string,
>({
  filterKeys,
  defaults,
  defaultSort,
  debounceMs = 350,
}: UseAdminListQueryParamsOptions<TFilters, TSortBy>) {
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
        const configuredDefault = defaults?.[key];
        const serialized = Array.isArray(value)
          ? value.join(",")
          : String(value ?? "");
        const fallback = Array.isArray(configuredDefault)
          ? configuredDefault.join(",")
          : String(configuredDefault ?? "all");
        if (!serialized || serialized === fallback) params.delete(key);
        else params.set(key, serialized);
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
    sortBy,
    sortOrder,
    sort,
    setSort,
    resetFilters,
  };
}
