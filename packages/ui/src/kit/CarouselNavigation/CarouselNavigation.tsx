"use client";

import { Button } from "@heroui/react/button";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { motion } from "motion/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FC,
} from "react";
import { carouselNavigationVariants } from "./CarouselNavigation.styles";
import type { CarouselNavigationProps } from "./CarouselNavigation.types";

function readIsRtl(node: HTMLElement | null, emblaApi?: CarouselNavigationProps["emblaApi"]) {
  if (emblaApi) {
    const direction = emblaApi.internalEngine().options.direction;
    if (direction === "rtl" || direction === "ltr") {
      return direction === "rtl";
    }
  }

  if (node) {
    const fromParent = getComputedStyle(node.parentElement ?? node).direction;
    if (fromParent === "rtl" || fromParent === "ltr") {
      return fromParent === "rtl";
    }
  }

  return document.documentElement.getAttribute("dir") === "rtl";
}

export const CarouselNavigation: FC<CarouselNavigationProps> = ({
  totalSlides: totalSlidesProp,
  currentIndex: currentIndexProp = 0,
  onIndexChange,
  autoDelay = 5000,
  emblaApi,
  loop = false,
  size = "sm",
  className,
  "aria-label": ariaLabel = "Carousel navigation",
  prevLabel = "Previous slide",
  nextLabel = "Next slide",
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isRtl, setIsRtl] = useState(false);
  const [emblaIndex, setEmblaIndex] = useState(0);
  const [emblaSlideCount, setEmblaSlideCount] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const syncEmbla = useCallback((api: NonNullable<typeof emblaApi>) => {
    setEmblaIndex(api.selectedScrollSnap());
    setEmblaSlideCount(api.scrollSnapList().length);
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
    setIsRtl(readIsRtl(rootRef.current, api));
  }, []);

  useLayoutEffect(() => {
    setIsRtl(readIsRtl(rootRef.current, emblaApi));
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    syncEmbla(emblaApi);
    emblaApi.on("reInit", syncEmbla);
    emblaApi.on("select", syncEmbla);

    return () => {
      emblaApi.off("reInit", syncEmbla);
      emblaApi.off("select", syncEmbla);
    };
  }, [emblaApi, syncEmbla]);

  const totalSlides = emblaApi
    ? emblaSlideCount || totalSlidesProp || 0
    : (totalSlidesProp ?? 0);
  const currentIndex = emblaApi ? emblaIndex : currentIndexProp;

  const slots = carouselNavigationVariants({ size });

  const goTo = (index: number) => {
    if (totalSlides <= 0) return;
    const next = ((index % totalSlides) + totalSlides) % totalSlides;

    if (emblaApi) {
      emblaApi.scrollTo(next);
      return;
    }

    onIndexChange?.(next);
  };

  const goPrev = () => {
    if (emblaApi) {
      emblaApi.scrollPrev();
      return;
    }

    if (!loop && currentIndex === 0) return;
    goTo(currentIndex - 1);
  };

  const goNext = () => {
    if (emblaApi) {
      emblaApi.scrollNext();
      return;
    }

    if (!loop && currentIndex >= totalSlides - 1) return;
    goTo(currentIndex + 1);
  };

  const prevDisabled = emblaApi
    ? !canScrollPrev
    : !loop && currentIndex === 0;
  const nextDisabled = emblaApi
    ? !canScrollNext
    : !loop && currentIndex >= totalSlides - 1;

  /**
   * Keep a stable LTR chrome (left chevron | right chevron).
   * In RTL carousels, visual-left advances forward and visual-right goes back.
   */
  const onLeftPress = isRtl ? goNext : goPrev;
  const onRightPress = isRtl ? goPrev : goNext;
  const leftDisabled = isRtl ? nextDisabled : prevDisabled;
  const rightDisabled = isRtl ? prevDisabled : nextDisabled;
  const leftLabel = isRtl ? nextLabel : prevLabel;
  const rightLabel = isRtl ? prevLabel : nextLabel;

  if (totalSlides <= 1) return null;

  const iconSize = size === "sm" ? 16 : 22;

  return (
    <div
      aria-label={ariaLabel}
      className={slots.root({ className })}
      dir="ltr"
      ref={rootRef}
      role="group"
    >
      <Button
        aria-label={leftLabel}
        className={slots.arrow()}
        isDisabled={leftDisabled}
        isIconOnly
        onPress={onLeftPress}
        size="lg"
        variant="tertiary"
      >
        <ChevronLeft rtlMirror={false} size={iconSize} />
      </Button>

      <div className={slots.indicators()}>
        {Array.from({ length: totalSlides }, (_, index) => {
          const isActive = index === currentIndex;

          return (
            <button
              aria-current={isActive ? "true" : undefined}
              aria-label={`Go to slide ${index + 1} of ${totalSlides}`}
              className={slots.indicator()}
              data-active={isActive}
              key={index}
              onClick={() => goTo(index)}
              type="button"
            >
              {isActive ? (
                <motion.span
                  animate={{ width: "100%" }}
                  className={slots.progress()}
                  initial={{ width: "0%" }}
                  key={currentIndex}
                  transition={{ duration: autoDelay / 1000, ease: "linear" }}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <Button
        aria-label={rightLabel}
        className={slots.arrow()}
        isDisabled={rightDisabled}
        isIconOnly
        onPress={onRightPress}
        size="lg"
        variant="tertiary"
      >
        <ChevronRight rtlMirror={false} size={iconSize} />
      </Button>
    </div>
  );
};
