"use client";

import type { EmblaCarouselType } from "embla-carousel";
import { useCallback, useEffect, useState } from "react";

export type UseEmblaLazyLoadOptions = {
  /**
   * Also mark neighbors of in-view slides as loadable.
   * @default 1
   */
  preloadAdjacent?: number;
  /**
   * When true, every slide is marked loaded (e.g. reduced motion / few slides).
   * @default false
   */
  loadAll?: boolean;
};

function expandWithAdjacent(
  indices: readonly number[],
  slideCount: number,
  adjacent: number,
): number[] {
  if (adjacent <= 0 || slideCount <= 0) return [...indices];

  const next = new Set(indices);
  for (const index of indices) {
    for (let offset = 1; offset <= adjacent; offset += 1) {
      const prev = index - offset;
      const ahead = index + offset;
      if (prev >= 0) next.add(prev);
      if (ahead < slideCount) next.add(ahead);
    }
  }
  return [...next];
}

/**
 * Tracks which Embla slides may load media. Once a slide is marked, it stays
 * loaded so images do not flash when scrolling back.
 */
export function useEmblaLazyLoad(
  emblaApi: EmblaCarouselType | undefined,
  {
    preloadAdjacent = 1,
    loadAll = false,
  }: UseEmblaLazyLoadOptions = {},
): ReadonlySet<number> {
  const [loaded, setLoaded] = useState<ReadonlySet<number>>(() => new Set());

  const sync = useCallback(
    (api: EmblaCarouselType) => {
      const slideCount = api.slideNodes().length;
      if (loadAll || slideCount <= 1) {
        setLoaded(new Set(Array.from({ length: slideCount }, (_, i) => i)));
        return;
      }

      const inView = expandWithAdjacent(
        api.slidesInView(),
        slideCount,
        preloadAdjacent,
      );

      setLoaded((prev) => {
        let changed = false;
        const next = new Set(prev);
        for (const index of inView) {
          if (!next.has(index)) {
            next.add(index);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    },
    [loadAll, preloadAdjacent],
  );

  useEffect(() => {
    if (!emblaApi) return;

    sync(emblaApi);
    emblaApi.on("slidesInView", sync);
    emblaApi.on("reInit", sync);
    emblaApi.on("select", sync);

    return () => {
      emblaApi.off("slidesInView", sync);
      emblaApi.off("reInit", sync);
      emblaApi.off("select", sync);
    };
  }, [emblaApi, sync]);

  return loaded;
}

export function isEmblaSlideLoaded(
  loaded: ReadonlySet<number>,
  index: number,
): boolean {
  return loaded.has(index);
}
