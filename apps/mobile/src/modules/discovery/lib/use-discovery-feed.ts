"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@repo/api";
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

export type DiscoveryFeedState = {
  sections: ResolvedDiscoverySection[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: ConnectionErrorKind | null;
  errorStatusCode?: number;
  loadMore: () => Promise<void>;
  reload: () => Promise<void>;
};

const PAGE_SIZE = 8;
const dedupeFirstPageRequest =
  createInFlightRequestDeduper<DiscoveryFeedResponse>();

export function useDiscoveryFeed(): DiscoveryFeedState {
  const { user, isAuthenticated, isReady } = useAuth();
  const origin = originFromUser(user);
  const originLat = origin?.lat;
  const originLng = origin?.lng;
  const requestContext = `${isAuthenticated ? (user?.id ?? "authenticated") : "guest"}:${originLat ?? ""}:${originLng ?? ""}`;
  const [sections, setSections] = useState<ResolvedDiscoverySection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<ConnectionErrorKind | null>(null);
  const [errorStatusCode, setErrorStatusCode] = useState<number | undefined>();
  const responseRef = useRef<DiscoveryFeedResponse | null>(null);
  const requestRef = useRef(0);

  const fetchFirstPage = useCallback(async () => {
    if (!isReady) return;
    const requestId = ++requestRef.current;
    setIsLoading(true);
    setError(null);
    setErrorStatusCode(undefined);
    try {
      const response = await dedupeFirstPageRequest(requestContext, () =>
        discoveryFeed.get({
          page: 1,
          page_size: PAGE_SIZE,
          lat: originLat,
          lng: originLng,
        }),
      );
      if (requestRef.current !== requestId) return;
      responseRef.current = response;
      setSections(response.result);
      setHasMore(response.pagination.has_more);
    } catch (cause) {
      if (requestRef.current !== requestId) return;
      setSections([]);
      setHasMore(false);
      const classified = classifyConnectionError(cause);
      setError(classified.kind);
      setErrorStatusCode(classified.statusCode);
    } finally {
      if (requestRef.current === requestId) setIsLoading(false);
    }
  }, [isReady, originLat, originLng, requestContext]);

  useEffect(() => {
    void fetchFirstPage();
    return () => {
      requestRef.current += 1;
    };
  }, [fetchFirstPage]);

  const loadMore = useCallback(async () => {
    const current = responseRef.current;
    const nextPage = current?.pagination.next;
    if (!current || !nextPage || isLoadingMore) return;
    setIsLoadingMore(true);
    setError(null);
    setErrorStatusCode(undefined);
    try {
      const response = await discoveryFeed.get({
        page: nextPage,
        page_size: current.pagination.page_size,
        feed_token: current.meta.feed_token,
      });
      responseRef.current = response;
      setSections((previous) => {
        const byId = new Map(previous.map((section) => [section.id, section]));
        for (const section of response.result) byId.set(section.id, section);
        return [...byId.values()];
      });
      setHasMore(response.pagination.has_more);
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 400) {
        await fetchFirstPage();
        return;
      }
      const classified = classifyConnectionError(cause);
      setError(classified.kind);
      setErrorStatusCode(classified.statusCode);
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchFirstPage, isLoadingMore]);

  return {
    sections,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    errorStatusCode,
    loadMore,
    reload: fetchFirstPage,
  };
}
