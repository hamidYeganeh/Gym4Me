"use client";

import { useEffect, useState } from "react";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { basicsSports, mediaFileUrl } from "@/shared/lib/api";
import {
  BROWSE_CLUBS,
  type BrowseClub,
} from "./clubs-browse-data";
import { mapSportToHomeItem } from "./home-browse-data";
import {
  BROWSE_SPORTS,
  clubsForSport,
  getBrowseSport,
  type BrowseSport,
} from "./sports-browse-data";

export type SportDetail = BrowseSport & {
  clubs: BrowseClub[];
};

type State = {
  sport: SportDetail | null;
  isLoading: boolean;
  source: "api" | "mock";
};

function toSportDetail(sport: BrowseSport): SportDetail {
  return {
    ...sport,
    clubs: clubsForSport(sport, BROWSE_CLUBS),
  };
}

export function useDiscoverySportDetail(sportId: string): State {
  const [state, setState] = useState<State>(() => {
    const mock = getBrowseSport(sportId);
    return {
      sport: mock ? toSportDetail(mock) : null,
      isLoading: true,
      source: "mock",
    };
  });

  useEffect(() => {
    let cancelled = false;
    const mock = getBrowseSport(sportId);

    setState((prev) => ({
      ...prev,
      sport: mock ? toSportDetail(mock) : prev.sport,
      isLoading: true,
    }));

    void (async () => {
      try {
        const node = await basicsSports.getSport(sportId);
        if (cancelled) return;
        const mapped = mapSportToHomeItem(
          node,
          mediaFileUrl(node.coverMediaId) ?? PLACEHOLDER_IMAGE,
        );
        const colorMatch =
          BROWSE_SPORTS.find(
            (item) => item.slug === mapped.slug || item.id === mapped.id,
          ) ?? mock;
        const sport: BrowseSport = {
          ...mapped,
          color: colorMatch?.color ?? "var(--stats-blue)",
          clubSportKey: colorMatch?.clubSportKey,
        };
        setState({
          sport: toSportDetail(sport),
          isLoading: false,
          source: "api",
        });
      } catch {
        if (cancelled) return;
        setState({
          sport: mock ? toSportDetail(mock) : null,
          isLoading: false,
          source: "mock",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sportId]);

  return state;
}
