"use client";

import { useEffect, useState } from "react";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { basicsSports, mediaFileUrl } from "@/shared/lib/api";
import type { HomeSportItem } from "./home-browse-data";
import { mapSportNodesToHomeItems } from "./sports-home";

export type DiscoveryHomeSportsState = {
  sports: HomeSportItem[];
  isLoading: boolean;
};

export function useDiscoveryHomeSports(): DiscoveryHomeSportsState {
  const [state, setState] = useState<DiscoveryHomeSportsState>({
    sports: [],
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const page = await basicsSports.listSports();
        if (cancelled) return;
        setState({
          sports: mapSportNodesToHomeItems(page.result, (node) =>
            mediaFileUrl(node.coverMediaId) ?? PLACEHOLDER_IMAGE,
          ),
          isLoading: false,
        });
      } catch {
        if (cancelled) return;
        setState({ sports: [], isLoading: false });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
