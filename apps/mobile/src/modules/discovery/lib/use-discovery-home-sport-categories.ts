"use client";

import { useEffect, useState } from "react";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { basicsSports, mediaFileUrl } from "@/shared/lib/api";
import {
  mapSportCategoryNodesToHomeItems,
  type HomeSportCategoryItem,
} from "./sports-home";

export type DiscoveryHomeSportCategoriesState = {
  categories: HomeSportCategoryItem[];
  isLoading: boolean;
};

export function useDiscoveryHomeSportCategories(): DiscoveryHomeSportCategoriesState {
  const [state, setState] = useState<DiscoveryHomeSportCategoriesState>({
    categories: [],
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const page = await basicsSports.listCategories();
        if (cancelled) return;
        setState({
          categories: mapSportCategoryNodesToHomeItems(
            page.result,
            (node) => mediaFileUrl(node.coverMediaId) ?? PLACEHOLDER_IMAGE,
          ),
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
