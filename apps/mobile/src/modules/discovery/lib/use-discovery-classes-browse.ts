"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  discoveryClasses,
} from "@/shared/lib/api";
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
  source: "api" | "mock";
  setActiveFilter: (id: ClassCategoryFilterId) => void;
};

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
  const [source, setSource] = useState<"api" | "mock">("api");

  useEffect(() => {
    setActiveFilter(categoryFromQuery);
  }, [categoryFromQuery]);

  const loadClasses = useCallback(async () => {
    setIsLoading(true);
    try {
      const page = await discoveryClasses.list({
        page_size: 40,
        ...(clubId ? { clubId } : {}),
        ...(sportId ? { sportId } : {}),
      });
      setClasses(page.result.map(mapDiscoveryClassToBrowse));
      setSource("api");
    } catch {
      setClasses([]);
      setSource("api");
    } finally {
      setIsLoading(false);
    }
  }, [clubId, sportId]);

  useEffect(() => {
    void loadClasses();
  }, [loadClasses]);

  const filters = useMemo(
    () => buildClassCategoryFilters(classes),
    [classes],
  );

  const filtered = useMemo(
    () => filterBrowseClasses(classes, activeFilter),
    [classes, activeFilter],
  );

  return {
    classes: filtered,
    filters,
    activeFilter,
    isLoading,
    source,
    setActiveFilter,
  };
}

export function resolveBrowseClassClubId(classId: string): string | undefined {
  return getBrowseClass(classId)?.clubId;
}
