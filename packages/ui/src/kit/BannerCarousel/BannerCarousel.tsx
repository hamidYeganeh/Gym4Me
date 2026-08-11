"use client";

import { Button } from "@heroui/react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { MediaImage } from "../../common/MediaImage";
import { bannerCarouselVariants } from "./BannerCarousel.styles";
import type { BannerCarouselProps } from "./BannerCarousel.types";

const DEFAULT_AUTOPLAY_MS = 6000;

export function BannerCarousel({
  slides,
  autoplayMs = DEFAULT_AUTOPLAY_MS,
  direction = "rtl",
  className,
  "aria-label": ariaLabel = "Banners",
  slideLabel,
}: BannerCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    direction,
    loop: slides.length > 1,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [interacting, setInteracting] = useState(false);

  const syncSelected = useCallback((api: NonNullable<typeof emblaApi>) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    syncSelected(emblaApi);
    const onPointerDown = () => setInteracting(true);
    const onSettle = () => setInteracting(false);
    emblaApi.on("select", syncSelected);
    emblaApi.on("reInit", syncSelected);
    emblaApi.on("pointerDown", onPointerDown);
    emblaApi.on("settle", onSettle);

    return () => {
      emblaApi.off("select", syncSelected);
      emblaApi.off("reInit", syncSelected);
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("settle", onSettle);
    };
  }, [emblaApi, syncSelected]);

  useEffect(() => {
    if (!emblaApi || autoplayMs <= 0 || slides.length <= 1 || interacting) {
      return;
    }
    const timer = setInterval(() => emblaApi.scrollNext(), autoplayMs);
    return () => clearInterval(timer);
  }, [emblaApi, autoplayMs, slides.length, interacting]);

  if (slides.length === 0) return null;

  const slots = bannerCarouselVariants();

  return (
    <div
      aria-label={ariaLabel}
      aria-roledescription="carousel"
      className={slots.root({ className })}
      role="group"
    >
      <div className={slots.viewport()} dir={direction} ref={emblaRef}>
        <div className={slots.track()}>
          {slides.map((slide, index) => {
            const image = (
              <MediaImage
                alt={slide.alt ?? ""}
                className={slots.image()}
                image={slide.imageUrl}
                priority={index === 0}
                sizes="100vw"
              />
            );

            return (
              <div className={slots.slide()} key={slide.id}>
                {slide.onPress ? (
                  <Button
                    aria-label={slide.alt ?? undefined}
                    className={slots.pressable()}
                    onPress={slide.onPress}
                    variant="ghost"
                  >
                    {image}
                  </Button>
                ) : (
                  image
                )}
              </div>
            );
          })}
        </div>
      </div>

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
                dotActive: index === selectedIndex,
              }).dot()}
              key={slide.id}
              onClick={() => emblaApi?.scrollTo(index)}
              role="tab"
              type="button"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
