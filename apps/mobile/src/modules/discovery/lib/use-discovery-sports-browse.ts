"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { statsPalette } from "@repo/theme/stats-colors";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { basicsSports, mediaFileUrl } from "@/shared/lib/api";
import { loadRemoteData } from "@/shared/lib/remote-data";
import {
  buildSportCategoryFilters,
  filterBrowseSports,
  type BrowseSport,
  type BrowseSportCategory,
  type SportCategoryFilter,
  type SportCategoryFilterId,
} from "./sports-browse-data";
import { mapSportToHomeItem } from "./home-browse-data";

export type DiscoverySportsBrowseOptions = {
  category?: string | null;
};

export type DiscoverySportsBrowseState = {
  sports: BrowseSport[];
  filters: SportCategoryFilter[];
  activeFilter: SportCategoryFilterId;
  isLoading: boolean;
  isError: boolean;
  isStale: boolean;
  source: "api" | "mock";
  retry: () => void;
  setActiveFilter: (id: SportCategoryFilterId) => void;
};

const SPORT_COLORS = ["var(--accent)", ...statsPalette] as const;

type SportsBrowsePayload = {
  sports: BrowseSport[];
  categories: BrowseSportCategory[];
};

let lastRealSportsPayload: SportsBrowsePayload | null = null;

async function fetchSportsBrowsePayload(): Promise<SportsBrowsePayload> {
  const [page, categoriesPage] = await Promise.all([
    basicsSports.listSports(),
    basicsSports.listCategories().catch(() => null),
  ]);

  return {
    categories: (categoriesPage?.result ?? [])
      .filter((node) => node.isActive)
      .map((node) => ({ id: node.id, name: node.name })),
    sports: page.result.slice(0, 48).map((node, index) => {
      const mapped = mapSportToHomeItem(
        node,
        mediaFileUrl(node.coverMediaId) ?? PLACEHOLDER_IMAGE,
      );
      return {
        ...mapped,
        color: SPORT_COLORS[index % SPORT_COLORS.length]!,
        clubSportKey: node.id,
      };
    }),
  };
}

export function useDiscoverySportsBrowse(
  options: DiscoverySportsBrowseOptions = {},
): DiscoverySportsBrowseState {
  const categoryFromQuery = options.category?.trim() || "all";
  const [activeFilter, setActiveFilter] =
    useState<SportCategoryFilterId>(categoryFromQuery);
  const [sports, setSports] = useState<BrowseSport[]>([]);
  const [categories, setCategories] = useState<BrowseSportCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [source, setSource] = useState<"api" | "mock">("api");

  useEffect(() => {
    setActiveFilter(categoryFromQuery);
  }, [categoryFromQuery]);

  const loadSports = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setIsStale(false);
    const result = await loadRemoteData({
      load: fetchSportsBrowsePayload,
      isEmpty: (payload) => payload.sports.length === 0,
      readCache: () => lastRealSportsPayload,
      writeCache: (payload) => {
        lastRealSportsPayload = payload;
      },
    });

    if (result.status === "error") {
      setSports([]);
      setCategories([]);
      setSource("api");
      setIsError(true);
      setIsLoading(false);
      return;
    }

    setSports(result.data.sports);
    setCategories(result.data.categories);
    setSource("api");
    setIsStale(result.status === "stale");
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadSports();
  }, [loadSports]);

  const filters = useMemo(
    () => buildSportCategoryFilters(sports, categories),
    [sports, categories],
  );

  const filtered = useMemo(
    () => filterBrowseSports(sports, activeFilter),
    [sports, activeFilter],
  );

  return {
    sports: filtered,
    filters,
    activeFilter,
    isLoading,
    isError,
    isStale,
    source,
    retry: loadSports,
    setActiveFilter,
  };
}
