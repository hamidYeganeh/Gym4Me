"use client";

import { Skeleton } from "@heroui/react/skeleton";
import { clubGalleryCardVariants } from "./ClubGalleryCard.styles";

export type ClubGalleryCardSkeletonProps = {
  className?: string;
};

/** Layout-faithful skeleton for {@link ClubGalleryCard}. */
export function ClubGalleryCardSkeleton({
  className,
}: ClubGalleryCardSkeletonProps) {
  const slots = clubGalleryCardVariants();

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={slots.root({ className })}
      role="status"
    >
      <Skeleton aria-hidden className={slots.media()} />
      <div className={slots.body()}>
        <Skeleton aria-hidden className="h-4 w-24 rounded-md" />
        <Skeleton aria-hidden className="h-3 w-16 rounded-md" />
        <Skeleton aria-hidden className="mt-0.5 h-3 w-14 rounded-md" />
      </div>
    </div>
  );
}
