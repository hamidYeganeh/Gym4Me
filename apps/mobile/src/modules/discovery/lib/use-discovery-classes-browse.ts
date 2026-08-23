"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { discoveryClasses } from "@/shared/lib/api";
import { loadRemoteData } from "@/shared/lib/remote-data";
import {
  buildClassCategoryFilters,
  filterBrowseClasses,
  getBrowseClass,
  type BrowseClass,
  type ClassCategoryFilter,
  type ClassCategoryFilterId,
} from "./classes-browse-data";
import { mapDiscoveryClassToBrowse } from "./map-discovery-class";

export type DiscoveryClassesBrowseOptions = {
  category?: string | null;
  clubId?: string | null;
  sportId?: string | null;
};

export type DiscoveryClassesBrowseState = {
  classes: BrowseClass[];
  filters: ClassCategoryFilter[];
  activeFilter: ClassCategoryFilterId;
  isLoading: boolean;
  isError: boolean;
  isStale: boolean;
  source: "api" | "mock";
  retry: () => void;
  setActiveFilter: (id: ClassCategoryFilterId) => void;
};

const lastRealClassesByQuery = new Map<string, BrowseClass[]>();

export function useDiscoveryClassesBrowse(
  options: DiscoveryClassesBrowseOptions = {},
): DiscoveryClassesBrowseState {
  const categoryFromQuery = options.category?.trim() || "all";
  const clubId = options.clubId?.trim() || undefined;
  const sportId = options.sportId?.trim() || undefined;
  const [activeFilter, setActiveFilter] =
    useState<ClassCategoryFilterId>(categoryFromQuery);
  const [classes, setClasses] = useState<BrowseClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [source, setSource] = useState<"api" | "mock">("api");

  useEffect(() => {
    setActiveFilter(categoryFromQuery);
  }, [categoryFromQuery]);

  const loadClasses = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setIsStale(false);
    const cacheKey = `${clubId ?? "all"}:${sportId ?? "all"}`;
    const result = await loadRemoteData({
      load: async () => {
        const page = await discoveryClasses.list({
          page_size: 40,
          ...(clubId ? { clubId } : {}),
          ...(sportId ? { sportId } : {}),
        });
        return page.result.map(mapDiscoveryClassToBrowse);
      },
      isEmpty: (items) => items.length === 0,
      readCache: () => lastRealClassesByQuery.get(cacheKey) ?? null,
      writeCache: (items) => lastRealClassesByQuery.set(cacheKey, items),
    });

    if (result.status === "error") {
      setClasses([]);
      setSource("api");
      setIsError(true);
      setIsLoading(false);
      return;
    }

    setClasses(result.data);
    setSource("api");
    setIsStale(result.status === "stale");
    setIsLoading(false);
  }, [clubId, sportId]);

  useEffect(() => {
    void loadClasses();
  }, [loadClasses]);

  const filters = useMemo(() => buildClassCategoryFilters(classes), [classes]);

  const filtered = useMemo(
    () => filterBrowseClasses(classes, activeFilter),
    [classes, activeFilter],
  );

  return {
    classes: filtered,
    filters,
    activeFilter,
    isLoading,
    isError,
    isStale,
    source,
    retry: loadClasses,
    setActiveFilter,
  };
}

export function resolveBrowseClassClubId(classId: string): string | undefined {
  return getBrowseClass(classId)?.clubId;
}
