"use client";

import { Children, isValidElement } from "react";
import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { discoveryHomeCarouselOptions } from "../../lib/discovery-home-carousel";
import { discoverySectionCarouselVariants } from "./DiscoverySectionCarousel.styles";
import type { DiscoverySectionCarouselProps } from "./DiscoverySectionCarousel.types";

import "swiper/css";
import "swiper/css/free-mode";

export function DiscoverySectionCarousel({
  children,
  ariaLabel,
  className,
  slideClassName,
  spaceBetween,
  onSlideChange,
}: DiscoverySectionCarouselProps) {
  const slots = discoverySectionCarouselVariants();
  const slides = Children.toArray(children);

  if (slides.length === 0) return null;

  return (
    <Swiper
      {...discoveryHomeCarouselOptions}
      aria-label={ariaLabel}
      aria-roledescription="carousel"
      className={slots.swiper({ className })}
      dir="rtl"
      modules={[FreeMode]}
      spaceBetween={spaceBetween ?? discoveryHomeCarouselOptions.spaceBetween}
      onSlideChange={
        onSlideChange
          ? (swiper) => onSlideChange(swiper.activeIndex)
          : undefined
      }
    >
      {slides.map((child, index) => (
        <SwiperSlide
          className={slots.slide({ className: slideClassName ?? "!w-auto" })}
          key={
            isValidElement(child) && child.key != null
              ? String(child.key)
              : `slide-${index}`
          }
        >
          {child}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
