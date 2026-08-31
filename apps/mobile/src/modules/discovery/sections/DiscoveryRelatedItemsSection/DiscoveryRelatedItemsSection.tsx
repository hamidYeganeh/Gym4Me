"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { useCallback, useId, useRef, useState } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { discoveryHomeCarouselOptions } from "../../lib/discovery-home-carousel";
import { discoveryRelatedItemsSectionVariants } from "./DiscoveryRelatedItemsSection.styles";
import type { DiscoveryRelatedItemsSectionProps } from "./DiscoveryRelatedItemsSection.types";

import "swiper/css";
import "swiper/css/free-mode";

const NAV_ICON_SIZE = 18;

function RelatedItemsSkyline({ className }: { className?: string }) {
  const gradientId = `related-items-skyline-${useId().replace(/:/g, "")}`;

  return (
    <svg
      aria-hidden
      className={className}
      preserveAspectRatio="none"
      viewBox="0 0 390 88"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
        </linearGradient>
      </defs>
      <path
        d="M0 88V62h18v-14h12v14h16V48h10v-10h8v10h14V52h12v-8h10v8h18V44h14v-18l8 10 8-10v18h16V56h12v-12h10v12h14V50h8v-6h6v6h12V58h10v-8h8v8h16V54h14v-16l6 8 6-8v16h14V60h12v-10h10v10h18V52h12v-8h10v8h16V56h14V42h10v14h12V48h10v-8h8v8h14V54h12v-12h10v12h16V50h14v-14l8 10 8-10v14h18V88H0Z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}

export function DiscoveryRelatedItemsSection({
  title,
  hint,
  ariaLabel,
  items,
  onItemPress,
  previousLabel = "Previous",
  nextLabel = "Next",
  showNavigation = true,
  className,
}: DiscoveryRelatedItemsSectionProps) {
  const slots = discoveryRelatedItemsSectionVariants();
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateNav = useCallback((swiper: SwiperInstance) => {
    setCanPrev(!swiper.isBeginning);
    setCanNext(!swiper.isEnd);
  }, []);

  if (items.length === 0) return null;

  const resolvedAriaLabel = ariaLabel ?? title;

  return (
    <section
      aria-label={resolvedAriaLabel}
      className={slots.root({ className })}
    >
      <RelatedItemsSkyline className={slots.skyline()} />

      <div className={slots.header()}>
        <div className={slots.titleBlock()}>
          <Typography className={slots.title()} type="h3" weight="bold">
            {title}
          </Typography>
          {hint ? (
            <Typography className={slots.hint()} type="body-xs">
              {hint}
            </Typography>
          ) : null}
        </div>

        {showNavigation && items.length > 1 ? (
          <div className={slots.nav()}>
            <Button
              aria-label={previousLabel}
              className={slots.navButton()}
              isDisabled={!canPrev}
              isIconOnly
              size="lg"
              variant="ghost"
              onPress={() => swiperRef.current?.slidePrev()}
            >
              <ChevronRight rtlMirror size={NAV_ICON_SIZE} />
            </Button>
            <Button
              aria-label={nextLabel}
              className={slots.navButton()}
              isDisabled={!canNext}
              isIconOnly
              size="lg"
              variant="ghost"
              onPress={() => swiperRef.current?.slideNext()}
            >
              <ChevronLeft rtlMirror size={NAV_ICON_SIZE} />
            </Button>
          </div>
        ) : null}
      </div>

      <div className={slots.scroller()}>
        <Swiper
          {...discoveryHomeCarouselOptions}
          aria-label={resolvedAriaLabel}
          aria-roledescription="carousel"
          className={slots.swiper()}
          dir="rtl"
          modules={[FreeMode]}
          onFromEdge={updateNav}
          onReachBeginning={(swiper) => updateNav(swiper)}
          onReachEnd={(swiper) => updateNav(swiper)}
          onResize={updateNav}
          onSlideChange={updateNav}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            updateNav(swiper);
          }}
        >
          {items.map((item, index) => (
            <SwiperSlide
              aria-label={`${index + 1} از ${items.length}`}
              className={slots.slide()}
              key={item.id}
              role="group"
            >
              <Button
                className={slots.item()}
                variant="ghost"
                onPress={
                  onItemPress ? () => onItemPress(item.id) : undefined
                }
              >
                {item.label}
              </Button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
