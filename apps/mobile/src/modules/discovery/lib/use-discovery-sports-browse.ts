"use client";

import { useEffect, useMemo, useState } from "react";
import { statsPalette } from "@repo/theme/stats-colors";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { basicsSports, mediaFileUrl } from "@/shared/lib/api";
import {
  BROWSE_SPORTS,
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
  source: "api" | "mock";
  setActiveFilter: (id: SportCategoryFilterId) => void;
};

const SPORT_COLORS = ["var(--accent)", ...statsPalette] as const;

export function useDiscoverySportsBrowse(
  options: DiscoverySportsBrowseOptions = {},
): DiscoverySportsBrowseState {
  const categoryFromQuery = options.category?.trim() || "all";
  const [activeFilter, setActiveFilter] =
    useState<SportCategoryFilterId>(categoryFromQuery);
  const [sports, setSports] = useState<BrowseSport[]>(BROWSE_SPORTS);
  const [categories, setCategories] = useState<BrowseSportCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState<"api" | "mock">("mock");

  useEffect(() => {
    setActiveFilter(categoryFromQuery);
  }, [categoryFromQuery]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [page, categoriesPage] = await Promise.all([
          basicsSports.listSports(),
          basicsSports.listCategories().catch(() => null),
        ]);
        if (cancelled) return;
        if (page.result.length === 0) {
          setSports(BROWSE_SPORTS);
          setCategories([]);
          setSource("mock");
          setIsLoading(false);
          return;
        }
        setCategories(
          (categoriesPage?.result ?? [])
            .filter((node) => node.isActive)
            .map((node) => ({ id: node.id, name: node.name })),
        );
        setSports(
          page.result.slice(0, 48).map((node, index) => {
            const mapped = mapSportToHomeItem(
              node,
              mediaFileUrl(node.coverMediaId) ?? PLACEHOLDER_IMAGE,
            );
            const mock = BROWSE_SPORTS.find(
              (item) => item.slug === mapped.slug || item.id === mapped.id,
            );
            return {
              ...mapped,
              color:
                mock?.color ??
                SPORT_COLORS[index % SPORT_COLORS.length]!,
              clubSportKey: mock?.clubSportKey,
            };
          }),
        );
        setSource("api");
        setIsLoading(false);
      } catch {
        if (cancelled) return;
        setSports(BROWSE_SPORTS);
        setCategories([]);
        setSource("mock");
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
    source,
    setActiveFilter,
  };
}
