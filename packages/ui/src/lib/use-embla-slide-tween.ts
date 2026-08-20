"use client";

import type { EmblaCarouselType, EmblaEventType } from "embla-carousel";
import { useCallback, useEffect, useRef } from "react";

export type UseEmblaSlideTweenOptions = {
  /**
   * Strength of scale/opacity falloff away from the selected snap.
   * @default 0.52
   */
  factor?: number;
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
 * Applies a soft scale + opacity falloff while Embla scrolls — the “juicy”
 * settle feel Embla’s engine duration alone does not provide.
 */
export function useEmblaSlideTween(
  emblaApi: EmblaCarouselType | undefined,
  {
    factor = 0.52,
    minScale = 0.92,
    minOpacity = 0.72,
    disabled = false,
  }: UseEmblaSlideTweenOptions = {},
) {
  const tweenFactor = useRef(0);
  const tweenNodes = useRef<HTMLElement[]>([]);

  const setTweenNodes = useCallback((api: EmblaCarouselType) => {
    tweenNodes.current = api.slideNodes().map((slide) => {
      const media = slide.querySelector<HTMLElement>("[data-embla-tween]");
      return media ?? slide;
    });
  }, []);

  const setTweenFactor = useCallback(
    (api: EmblaCarouselType) => {
      tweenFactor.current = factor * api.scrollSnapList().length;
    },
    [factor],
  );

  const tween = useCallback(
    (api: EmblaCarouselType, eventName?: EmblaEventType) => {
      if (disabled) {
        for (const node of tweenNodes.current) {
          node.style.transform = "";
          node.style.opacity = "";
        }
        return;
      }

      const engine = api.internalEngine();
      const scrollProgress = api.scrollProgress();
      const slidesInView = api.slidesInView();
      const isScrollEvent = eventName === "scroll";

      api.scrollSnapList().forEach((scrollSnap, snapIndex) => {
        let diffToTarget = scrollSnap - scrollProgress;
        const slidesInSnap = engine.slideRegistry[snapIndex];

        slidesInSnap?.forEach((slideIndex) => {
          if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

          if (engine.options.loop) {
            for (const loopItem of engine.slideLooper.loopPoints) {
              const target = loopItem.target();
              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target);
                if (sign === -1) {
                  diffToTarget = scrollSnap - (1 + scrollProgress);
                }
                if (sign === 1) {
                  diffToTarget = scrollSnap + (1 - scrollProgress);
                }
              }
            }
          }

          const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current);
          const scale = numberWithinRange(tweenValue, minScale, 1);
          const opacity = numberWithinRange(tweenValue, minOpacity, 1);
          const node = tweenNodes.current[slideIndex];
          if (!node) return;
          node.style.transform = `scale(${scale})`;
          node.style.opacity = String(opacity);
        });
      });
    },
    [disabled, minOpacity, minScale],
  );

  useEffect(() => {
    if (!emblaApi) return;

    setTweenNodes(emblaApi);
    setTweenFactor(emblaApi);
    tween(emblaApi);

    emblaApi
      .on("reInit", setTweenNodes)
      .on("reInit", setTweenFactor)
      .on("reInit", tween)
      .on("scroll", tween)
      .on("slideFocus", tween);

    return () => {
      emblaApi
        .off("reInit", setTweenNodes)
        .off("reInit", setTweenFactor)
        .off("reInit", tween)
        .off("scroll", tween)
        .off("slideFocus", tween);

      for (const node of tweenNodes.current) {
        node.style.transform = "";
        node.style.opacity = "";
      }
    };
  }, [emblaApi, setTweenFactor, setTweenNodes, tween]);
}
