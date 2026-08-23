"use client";

import { useEffect, useState } from "react";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import {
  basicsSports,
  discoveryClubs,
  isDiscoveryApiId,
  isDiscoveryDemoId,
  mediaFileUrl,
} from "@/shared/lib/api";
import type { BrowseClub } from "./clubs-browse-data";
import { mapDiscoveryClubToBrowse } from "./map-discovery-club-browse";
import { mapSportToHomeItem } from "./home-browse-data";
import {
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

function toSportDetail(
  sport: BrowseSport,
  clubs: BrowseClub[] = clubsForSport(sport),
): SportDetail {
  return {
    ...sport,
    clubs,
  };
}

export function useDiscoverySportDetail(sportId: string): State {
  const useApi = isDiscoveryApiId(sportId);
  const useDemo = isDiscoveryDemoId(sportId);
  const [state, setState] = useState<State>(() => {
    const mock = useDemo ? getBrowseSport(sportId) : undefined;
    return {
      sport: mock ? toSportDetail(mock) : null,
      isLoading: useApi,
      source: useDemo ? "mock" : "api",
    };
  });

  useEffect(() => {
    let cancelled = false;
    const mock = useDemo ? getBrowseSport(sportId) : undefined;

    if (useDemo) {
      setState({
        sport: mock ? toSportDetail(mock) : null,
        isLoading: false,
        source: "mock",
      });
      return;
    }

    if (!useApi) {
      setState({ sport: null, isLoading: false, source: "api" });
      return;
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      source: "api",
    }));

    void (async () => {
      try {
        const [node, clubsPage] = await Promise.all([
          basicsSports.getSport(sportId),
          discoveryClubs.list({ sportId, page_size: 12 }),
        ]);
        if (cancelled) return;
        const mapped = mapSportToHomeItem(
          node,
          mediaFileUrl(node.coverMediaId) ?? PLACEHOLDER_IMAGE,
        );
        const sport: BrowseSport = {
          ...mapped,
          color: "var(--stats-blue)",
          clubSportKey: node.id,
        };
        setState({
          sport: toSportDetail(
            sport,
            clubsPage.result.map((club) =>
              mapDiscoveryClubToBrowse(club as never),
            ),
          ),
          isLoading: false,
          source: "api",
        });
      } catch {
        if (cancelled) return;
        setState({
          sport: null,
          isLoading: false,
          source: "api",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sportId, useApi, useDemo]);

  return state;
}
