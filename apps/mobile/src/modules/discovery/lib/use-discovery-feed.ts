"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  DiscoveryFeedResponse,
  ResolvedDiscoverySection,
} from "@repo/api/discovery";
import { discoveryFeed } from "@/shared/lib/api";
import {
  classifyConnectionError,
  type ConnectionErrorKind,
} from "@/shared/lib/classify-connection-error";
import { createInFlightRequestDeduper } from "@/shared/lib/in-flight-request";
import { useAuth } from "@/shared/providers/AuthProvider";
import { originFromUser } from "./nearby-clubs-home";

export type DiscoveryFeedLocation = {
  lat: number;
  lng: number;
};

export type DiscoveryFeedState = {
  sections: ResolvedDiscoverySection[];
  isLoading: boolean;
  error: ConnectionErrorKind | null;
  errorStatusCode?: number;
  reload: () => Promise<void>;
};

const FEED_PAGE_SIZE = 8;

const dedupeFirstPageRequest = createInFlightRequestDeduper<
  DiscoveryFeedResponse
>();

export function useDiscoveryFeed(
  selectedLocation?: DiscoveryFeedLocation | null,
): DiscoveryFeedState {
  const { user, isAuthenticated, isReady } = useAuth();
  const origin = selectedLocation ?? originFromUser(user);
  const originLat = origin?.lat;
  const originLng = origin?.lng;
  const requestContext = `${isAuthenticated ? (user?.id ?? "authenticated") : "guest"}:${originLat ?? ""}:${originLng ?? ""}`;
  const [sections, setSections] = useState<ResolvedDiscoverySection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ConnectionErrorKind | null>(null);
  const [errorStatusCode, setErrorStatusCode] = useState<number | undefined>();
  const requestRef = useRef(0);

  const fetchFeed = useCallback(async () => {
    if (!isReady) return;
    const requestId = ++requestRef.current;
    setIsLoading(true);
    setError(null);
    setErrorStatusCode(undefined);
    try {
      const response = await dedupeFirstPageRequest(requestContext, () =>
        discoveryFeed.get({
          page: 1,
          page_size: FEED_PAGE_SIZE,
          lat: originLat,
          lng: originLng,
        }),
      );
      if (requestRef.current !== requestId) return;
      setSections(response.result);
      setIsLoading(false);

      let current = response;
      while (current.pagination.next && requestRef.current === requestId) {
        current = await discoveryFeed.get({
          page: current.pagination.next,
          page_size: current.pagination.page_size,
          feed_token: current.meta.feed_token,
        });
        if (requestRef.current !== requestId) return;
        setSections((previous) => {
          const byId = new Map(previous.map((section) => [section.id, section]));
          for (const section of current.result) byId.set(section.id, section);
          return [...byId.values()];
        });
      }
    } catch (cause) {
      if (requestRef.current !== requestId) return;
      setSections((current) => (current.length > 0 ? current : []));
      const classified = classifyConnectionError(cause);
      setError(classified.kind);
      setErrorStatusCode(classified.statusCode);
    } finally {
      if (requestRef.current === requestId) setIsLoading(false);
    }
  }, [isReady, originLat, originLng, requestContext]);

  useEffect(() => {
    void fetchFeed();
    return () => {
      requestRef.current += 1;
    };
  }, [fetchFeed]);

  return {
    sections,
    isLoading,
    error,
    errorStatusCode,
    reload: fetchFeed,
  };
}
