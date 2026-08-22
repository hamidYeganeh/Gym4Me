"use client";

import { useEffect, useState } from "react";
import { basicsRefs, discoveryClubs } from "@/shared/lib/api";
import {
  mapClubCategoryRefsToHomeItems,
  type HomeClubCategoryItem,
} from "./club-categories-home";

export type DiscoveryHomeCategoriesState = {
  categories: HomeClubCategoryItem[];
  isLoading: boolean;
};

export function useDiscoveryHomeCategories(): DiscoveryHomeCategoriesState {
  const [state, setState] = useState<DiscoveryHomeCategoriesState>({
    categories: [],
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [page, facets] = await Promise.all([
          basicsRefs.list("club_category"),
          discoveryClubs.listFacets().catch(() => null),
        ]);
        if (cancelled) return;
        const counts = facets
          ? new Map(facets.categories.map((facet) => [facet.id, facet.count]))
          : undefined;
        setState({
          categories: mapClubCategoryRefsToHomeItems(page.result, counts),
          isLoading: false,
        });
      } catch {
        if (cancelled) return;
        setState({ categories: [], isLoading: false });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
