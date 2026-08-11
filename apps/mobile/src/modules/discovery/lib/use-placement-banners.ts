"use client";

import { useEffect, useState } from "react";
import type { BannerLinkKind, BannerPlacement } from "@repo/api";
import { bannersApi, mediaFileUrl } from "@/shared/lib/api";

export type PlacementBannerSlide = {
  id: string;
  imageUrl: string;
  alt: string | null;
  linkKind: BannerLinkKind;
  linkUrl: string | null;
};

export type PlacementBannersState = {
  slides: PlacementBannerSlide[];
  isLoading: boolean;
};

/** Active admin banners for one app placement, flattened to carousel slides. */
export function usePlacementBanners(
  placement: BannerPlacement,
): PlacementBannersState {
  const [state, setState] = useState<PlacementBannersState>({
    slides: [],
    isLoading: true,
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
            });
          });
        }

        setState({ slides, isLoading: false });
      } catch {
        if (cancelled) return;
        setState({ slides: [], isLoading: false });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [placement]);

  return state;
}
