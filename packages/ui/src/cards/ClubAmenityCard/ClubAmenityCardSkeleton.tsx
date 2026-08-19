"use client";

import { Skeleton } from "@heroui/react/skeleton";
import { clubAmenityCardVariants } from "./ClubAmenityCard.styles";

export type ClubAmenityCardSkeletonProps = {
  className?: string;
};

/** Layout-faithful skeleton for {@link ClubAmenityCard}. */
export function ClubAmenityCardSkeleton({
  className,
}: ClubAmenityCardSkeletonProps) {
  const slots = clubAmenityCardVariants();

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={slots.root({ className })}
      role="status"
    >
      <div className={slots.body()}>
        <div className={slots.header()}>
          <Skeleton aria-hidden className="h-5 w-24 rounded-md" />
          <Skeleton aria-hidden className="h-4 w-16 rounded-md" />
        </div>
      </div>
      <Skeleton aria-hidden className="size-[88px] shrink-0 rounded-[22px]" />
    </div>
  );
}
