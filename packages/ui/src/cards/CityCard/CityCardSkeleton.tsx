"use client";

import { Skeleton } from "@heroui/react/skeleton";
import { cityCardVariants } from "./CityCard.styles";
import type { CityCardSize } from "./CityCard.types";

const CITY_SIZE: Record<CityCardSize, string> = {
  sm: "h-5 w-16",
  md: "h-6 w-20",
  lg: "h-8 w-24",
};

const ACTION_SIZE: Record<CityCardSize, string> = {
  sm: "h-7",
  md: "h-8",
  lg: "h-9",
};

export type CityCardSkeletonProps = {
  size?: CityCardSize;
  className?: string;
};

/** Layout-faithful skeleton for {@link CityCard}. */
export function CityCardSkeleton({
  size = "md",
  className,
}: CityCardSkeletonProps) {
  const slots = cityCardVariants({ size });

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={slots.root({
        className: ["border border-border bg-surface", className]
          .filter(Boolean)
          .join(" "),
      })}
      data-size={size}
      role="status"
    >
      <Skeleton aria-hidden className="absolute inset-0 rounded-[inherit]" />
      <div className={slots.body()}>
        <Skeleton
          aria-hidden
          className={`relative z-10 ${CITY_SIZE[size]} rounded-md`}
        />
        <div className={slots.footer()}>
          <Skeleton
            aria-hidden
            className={`relative z-10 ${ACTION_SIZE[size]} w-full rounded-full`}
          />
        </div>
      </div>
    </div>
  );
}
