"use client";

import { Skeleton } from "@heroui/react/skeleton";
import { bannerCarouselVariants } from "./BannerCarousel.styles";

export type BannerCarouselSkeletonProps = {
  className?: string;
};

/** Layout-faithful skeleton for {@link BannerCarousel}. */
export function BannerCarouselSkeleton({
  className,
}: BannerCarouselSkeletonProps) {
  const slots = bannerCarouselVariants();

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={slots.root({ className })}
      role="status"
    >
      <Skeleton aria-hidden className={slots.image()} />
    </div>
  );
}
