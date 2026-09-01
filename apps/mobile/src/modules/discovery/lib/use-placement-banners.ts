"use client";

import { useEffect, useState } from "react";
import type { BannerAspectRatio, BannerLinkKind, BannerOverlayPlacement, BannerPlacement, BannerRadius } from "@repo/api";
import { bannersApi, mediaFileUrl } from "@/shared/lib/api";

export type PlacementBannerSlide = {
  id: string;
  imageUrl: string;
  alt: string | null;
  linkKind: BannerLinkKind;
  linkUrl: string | null;
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

export type PlacementBanner = {
  id: string;
  slug: string;
  label: string;
  ratio: BannerAspectRatio;
  radius: BannerRadius;
  slides: PlacementBannerSlide[];
};

export type PlacementBannersState = {
  banners: PlacementBanner[];
  isLoading: boolean;
};

/** Active admin banners for one placement. */
export function usePlacementBanners(
  placement: BannerPlacement,
): PlacementBannersState {
  const [state, setState] = useState<PlacementBannersState>({
    banners: [],
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const banners = await bannersApi.list({ placement });
        if (cancelled) return;

        setState({
          banners: banners
            .map((banner) => {
              const slides: PlacementBannerSlide[] = [];
              banner.slides.forEach((slide, index) => {
                const imageUrl = mediaFileUrl(slide.mediaId);
                if (!imageUrl) return;
                slides.push({
                  id: `${banner.slug}-${index}`,
                  imageUrl,
                  alt: slide.alt,
                  linkKind: slide.linkKind,
                  linkUrl: slide.linkUrl,
                  gradient: slide.gradient,
                  title: slide.title,
                  action: slide.action,
                });
              });
              if (slides.length === 0) return null;
              return {
                id: banner.id,
                slug: banner.slug,
                label: banner.label,
                ratio: banner.ratio,
                radius: banner.radius,
                slides,
              };
            })
            .filter((banner): banner is PlacementBanner => banner != null),
          isLoading: false,
        });
      } catch {
        if (cancelled) return;
        setState({ banners: [], isLoading: false });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [placement]);

  return state;
}
