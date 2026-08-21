"use client";

import { useCallback } from "react";
import type { Swiper as SwiperInstance } from "swiper";

export type UseSwiperSlideTweenOptions = {
  /** Scale at the farthest snap distance. @default 0.92 */
  minScale?: number;
  /** Opacity at the farthest snap distance. @default 0.72 */
  minOpacity?: number;
  /** Disable tweens (e.g. `prefers-reduced-motion`). */
  disabled?: boolean;
};

function numberWithinRange(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Soft scale + opacity falloff from Swiper slide progress
 * (`watchSlidesProgress` must be enabled).
 */
export function useSwiperSlideTween({
  minScale = 0.92,
  minOpacity = 0.72,
  disabled = false,
}: UseSwiperSlideTweenOptions = {}) {
  return useCallback(
    (swiper: SwiperInstance) => {
      for (const slide of swiper.slides) {
        const node =
          slide.querySelector<HTMLElement>("[data-swiper-tween]") ?? slide;

        if (disabled) {
          node.style.transform = "";
          node.style.opacity = "";
          continue;
        }

        const progress = Math.abs(slide.progress ?? 0);
        const scale = numberWithinRange(1 - progress * 0.12, minScale, 1);
        const opacity = numberWithinRange(1 - progress * 0.28, minOpacity, 1);
        node.style.transform = `scale(${scale})`;
        node.style.opacity = String(opacity);
      }
    },
    [disabled, minOpacity, minScale],
  );
}
