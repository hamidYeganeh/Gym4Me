"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { MediaImage } from "../../common/MediaImage";
import { SWIPER_SPEED, swiperOptions } from "../../lib/swiper";
import { useSwiperLazyLoad } from "../../lib/use-swiper-lazy-load";
import { useSwiperSlideTween } from "../../lib/use-swiper-slide-tween";
import { bannerCarouselVariants } from "./BannerCarousel.styles";
import type {
  BannerCarouselAspectRatio,
  BannerCarouselProps,
  BannerCarouselRadius,
  BannerCarouselSlide,
  BannerOverlayPlacement,
} from "./BannerCarousel.types";

import "swiper/css";

const DEFAULT_AUTOPLAY_MS = 6000;
const DEFAULT_TITLE_PLACEMENT: BannerOverlayPlacement = "bottom-start";
const DEFAULT_ACTION_PLACEMENT: BannerOverlayPlacement = "bottom-end";

function SlideFrame({
  slide,
  canLoad,
  priority,
  aspectRatio,
  radius,
  fullBleed,
}: {
  slide: BannerCarouselSlide;
  canLoad: boolean;
  priority: boolean;
  aspectRatio: BannerCarouselAspectRatio;
  radius: BannerCarouselRadius;
  fullBleed: boolean;
}) {
  const ratio = slide.ratio ?? aspectRatio;
  const cornerRadius = slide.radius ?? radius;
  const titlePlacement = slide.title?.placement ?? DEFAULT_TITLE_PLACEMENT;
  const actionPlacement = slide.action?.placement ?? DEFAULT_ACTION_PLACEMENT;
  const slots = bannerCarouselVariants({
    aspectRatio: ratio,
    radius: cornerRadius,
    fullBleed,
    titlePlacement,
    actionPlacement,
  });

  const media = canLoad ? (
    <MediaImage
      alt={slide.alt ?? ""}
      className={slots.image()}
      image={slide.imageUrl}
      priority={priority}
      sizes="100vw"
    />
  ) : (
    <div aria-hidden className={slots.imagePlaceholder()} />
  );

  const overlay = (
    <>
      {slide.gradient ? <div aria-hidden className={slots.gradient()} /> : null}
      {slide.title?.text ? (
        <div className={slots.titleWrap({ titlePlacement })}>
          <Typography className={slots.title()} type="body" weight="bold">
            {slide.title.text}
          </Typography>
        </div>
      ) : null}
      {slide.action?.label ? (
        <div className={slots.actionWrap({ actionPlacement })}>
          <Button
            className={slots.action()}
            onPress={slide.action.onPress}
            size="md"
            variant="primary"
          >
            {slide.action.label}
          </Button>
        </div>
      ) : null}
    </>
  );

  // Nested interactive controls are invalid — prefer the dedicated CTA when present.
  if (slide.action?.label) {
    return (
      <div className={slots.frame()}>
        {media}
        {overlay}
      </div>
    );
  }

  if (slide.onPress && canLoad) {
    return (
      <Button
        aria-label={slide.alt ?? slide.title?.text ?? undefined}
        className={slots.pressable()}
        onPress={slide.onPress}
        variant="ghost"
      >
        <div className={slots.frame()}>
          {media}
          {overlay}
        </div>
      </Button>
    );
  }

  return (
    <div className={slots.frame()}>
      {media}
      {overlay}
    </div>
  );
}

export function BannerCarousel({
  slides,
  autoplayMs = DEFAULT_AUTOPLAY_MS,
  direction = "rtl",
  aspectRatio = "16/9",
  radius = "surface",
  fullBleed = false,
  className,
  "aria-label": ariaLabel = "Banners",
  slideLabel,
}: BannerCarouselProps) {
  const reduceMotion = useReducedMotion();
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const loadedSlides = useSwiperLazyLoad(selectedIndex, slides.length, {
    loadAll: reduceMotion === true || slides.length <= 2,
    preloadAdjacent: 1,
  });

  const applyTween = useSwiperSlideTween({
    disabled: reduceMotion === true || fullBleed,
    minScale: 0.94,
    minOpacity: 0.78,
  });

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper?.autoplay) return;

    if (interacting || autoplayMs <= 0 || slides.length <= 1) {
      swiper.autoplay.stop();
      return;
    }

    swiper.autoplay.start();
  }, [autoplayMs, interacting, slides.length]);

  if (slides.length === 0) return null;

  const slots = bannerCarouselVariants({ aspectRatio, radius, fullBleed });
  const loop = slides.length > 1;
  const options = swiperOptions({
    loop,
    speed: reduceMotion ? SWIPER_SPEED.instant : SWIPER_SPEED.juicy,
    watchSlidesProgress: !reduceMotion && !fullBleed,
    autoplay:
      autoplayMs > 0 && loop
        ? {
            delay: autoplayMs,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }
        : false,
  });

  return (
    <div
      aria-label={ariaLabel}
      aria-roledescription="carousel"
      className={slots.root({ className })}
      role="group"
    >
      <Swiper
        {...options}
        className={slots.viewport()}
        dir={direction}
        modules={[Autoplay]}
        onSetTranslate={applyTween}
        onSlideChange={(swiper) => setSelectedIndex(swiper.realIndex)}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          applyTween(swiper);
        }}
        onTouchEnd={() => setInteracting(false)}
        onTouchStart={() => setInteracting(true)}
      >
        {slides.map((slide, index) => (
          <SwiperSlide className={slots.slide()} key={slide.id}>
            <div className={slots.tween()} data-swiper-tween="">
              <SlideFrame
                aspectRatio={aspectRatio}
                canLoad={loadedSlides.has(index)}
                fullBleed={fullBleed}
                priority={index === 0}
                radius={radius}
                slide={slide}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {slides.length > 1 ? (
        <div className={slots.dots()} role="tablist">
          {slides.map((slide, index) => (
            <button
              aria-label={
                slideLabel?.(index + 1, slides.length) ??
                `${index + 1} / ${slides.length}`
              }
              aria-selected={index === selectedIndex}
              className={bannerCarouselVariants({
                aspectRatio,
                radius,
                fullBleed,
                dotActive: index === selectedIndex,
              }).dot()}
              key={slide.id}
              onClick={() => swiperRef.current?.slideToLoop(index)}
              role="tab"
              type="button"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
