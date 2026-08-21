"use client";

import { Skeleton } from "@heroui/react/skeleton";
import { bannerCarouselVariants } from "./BannerCarousel.styles";
import type {
  BannerCarouselAspectRatio,
  BannerCarouselRadius,
} from "./BannerCarousel.types";

export type BannerCarouselSkeletonProps = {
  className?: string;
  aspectRatio?: BannerCarouselAspectRatio;
  radius?: BannerCarouselRadius;
  fullBleed?: boolean;
};

/** Layout-faithful skeleton for {@link BannerCarousel}. */
export function BannerCarouselSkeleton({
  className,
  aspectRatio = "16/9",
  radius = "surface",
  fullBleed = false,
}: BannerCarouselSkeletonProps) {
  const slots = bannerCarouselVariants({ aspectRatio, radius, fullBleed });

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={slots.root({ className })}
      role="status"
    >
      <Skeleton aria-hidden className={slots.frame()} />
    </div>
  );
}
