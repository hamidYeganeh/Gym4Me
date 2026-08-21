"use client";

import { useEffect, useState } from "react";

export type UseSwiperLazyLoadOptions = {
  /**
   * Also mark neighbors of the active slide as loadable.
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
  index: number,
  slideCount: number,
  adjacent: number,
): number[] {
  if (slideCount <= 0) return [];
  const next = new Set<number>([index]);
  for (let offset = 1; offset <= adjacent; offset += 1) {
    const prev = index - offset;
    const ahead = index + offset;
    if (prev >= 0) next.add(prev);
    if (ahead < slideCount) next.add(ahead);
  }
  return [...next];
}

/**
 * Tracks which Swiper slides may load media. Once a slide is marked, it stays
 * loaded so images do not flash when scrolling back.
 */
export function useSwiperLazyLoad(
  activeIndex: number,
  slideCount: number,
  {
    preloadAdjacent = 1,
    loadAll = false,
  }: UseSwiperLazyLoadOptions = {},
): ReadonlySet<number> {
  const [loaded, setLoaded] = useState<ReadonlySet<number>>(() => new Set());

  useEffect(() => {
    if (loadAll || slideCount <= 1) {
      setLoaded(new Set(Array.from({ length: slideCount }, (_, i) => i)));
      return;
    }

    const inView = expandWithAdjacent(
      activeIndex,
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
  }, [activeIndex, loadAll, preloadAdjacent, slideCount]);

  return loaded;
}

export function isSwiperSlideLoaded(
  loaded: ReadonlySet<number>,
  index: number,
): boolean {
  return loaded.has(index);
}
