"use client";

import { useEffect, useState } from "react";
import type {
  BannerAspectRatio,
  BannerLinkKind,
  BannerOverlayPlacement,
  BannerPlacement,
  BannerRadius,
} from "@repo/api";
import { bannersApi, mediaFileUrl } from "@/shared/lib/api";
import { MOCK_DISCOVERY_HOME_BANNERS } from "./discovery-banners-data";

export type PlacementBannerSlide = {
  id: string;
  imageUrl: string;
  alt: string | null;
  linkKind: BannerLinkKind;
  linkUrl: string | null;
  ratio: BannerAspectRatio;
  radius: BannerRadius;
  gradient: boolean;
  title: {
    text: string;
    placement: BannerOverlayPlacement;
  } | null;
  action: {
    label: string;
    placement: BannerOverlayPlacement;
  } | null;
};

export type PlacementBannersState = {
  slides: PlacementBannerSlide[];
  isLoading: boolean;
  source: "api" | "mock";
};

function mockSlidesForPlacement(
  placement: BannerPlacement,
): PlacementBannerSlide[] {
  if (placement === "discovery_home") {
    return MOCK_DISCOVERY_HOME_BANNERS.map((slide) => ({
      ...slide,
      title: slide.title ?? null,
      action: slide.action ?? null,
    }));
  }
  return [];
}

/** Active admin banners for one placement, flattened to carousel slides. */
export function usePlacementBanners(
  placement: BannerPlacement,
): PlacementBannersState {
  const [state, setState] = useState<PlacementBannersState>({
    slides: [],
    isLoading: true,
    source: "mock",
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const banners = await bannersApi.list({ placement });
        if (cancelled) return;

        const slides: PlacementBannerSlide[] = [];
        for (const banner of banners) {
          banner.slides.forEach((slide, index) => {
            const imageUrl = mediaFileUrl(slide.mediaId);
            if (!imageUrl) return;
            slides.push({
              id: `${banner.id}-${index}`,
              imageUrl,
              alt: slide.alt,
              linkKind: slide.linkKind,
              linkUrl: slide.linkUrl,
              ratio: slide.ratio,
              radius: slide.radius,
              gradient: slide.gradient,
              title: slide.title,
              action: slide.action,
            });
          });
        }

        if (slides.length > 0) {
          setState({ slides, isLoading: false, source: "api" });
          return;
        }

        setState({
          slides: mockSlidesForPlacement(placement),
          isLoading: false,
          source: "mock",
        });
      } catch {
        if (cancelled) return;
        setState({
          slides: mockSlidesForPlacement(placement),
          isLoading: false,
          source: "mock",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [placement]);

  return state;
}
