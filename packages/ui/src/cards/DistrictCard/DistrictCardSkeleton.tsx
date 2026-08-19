"use client";

import { Skeleton } from "@heroui/react/skeleton";
import { districtCardVariants } from "./DistrictCard.styles";
import type { DistrictCardSize } from "./DistrictCard.types";

const TITLE_SIZE: Record<DistrictCardSize, string> = {
  sm: "h-5 w-20",
  md: "h-6 w-24",
  lg: "h-8 w-28",
};

export type DistrictCardSkeletonProps = {
  size?: DistrictCardSize;
  className?: string;
};

/** Layout-faithful skeleton for {@link DistrictCard}. */
export function DistrictCardSkeleton({
  size = "md",
  className,
}: DistrictCardSkeletonProps) {
  const slots = districtCardVariants({ size });

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
      <div className={slots.footer()}>
        <Skeleton
          aria-hidden
          className={`relative z-10 ${TITLE_SIZE[size]} rounded-md`}
        />
        <Skeleton aria-hidden className="relative z-10 h-3.5 w-16 rounded-md" />
      </div>
    </div>
  );
}
