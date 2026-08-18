"use client";

import { Skeleton } from "@heroui/react/skeleton";
import { coachNearbyCardVariants } from "./CoachNearbyCard.styles";

export type CoachNearbyCardSkeletonProps = {
  className?: string;
};

/** Layout-faithful skeleton for {@link CoachNearbyCard}. */
export function CoachNearbyCardSkeleton({
  className,
}: CoachNearbyCardSkeletonProps) {
  const slots = coachNearbyCardVariants();

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={slots.root({ className })}
      role="status"
    >
      <Skeleton aria-hidden className="size-14 shrink-0 rounded-full" />
      <div className={slots.content()}>
        <Skeleton aria-hidden className="h-5 w-36 rounded-md" />
        <Skeleton aria-hidden className="h-4 w-24 rounded-md" />
        <div className={slots.tags()}>
          <Skeleton aria-hidden className="h-4 w-20 rounded-md" />
          <Skeleton aria-hidden className="h-4 w-16 rounded-md" />
        </div>
        <div className={slots.ratingRow()}>
          <Skeleton aria-hidden className="h-3.5 w-24 rounded-md" />
          <Skeleton aria-hidden className="h-3.5 w-10 rounded-md" />
        </div>
        <Skeleton aria-hidden className="h-4 w-28 rounded-md" />
      </div>
      <Skeleton aria-hidden className="mt-1 size-4 shrink-0 rounded-sm" />
    </div>
  );
}
