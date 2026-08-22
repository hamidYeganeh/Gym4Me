"use client";

import { Skeleton } from "@heroui/react/skeleton";
import { clubCategoryTileVariants } from "./ClubCategoryTile.styles";

export type ClubCategoryTileSkeletonProps = {
  className?: string;
};

/** Layout-faithful skeleton for {@link ClubCategoryTile}. */
export function ClubCategoryTileSkeleton({
  className,
}: ClubCategoryTileSkeletonProps) {
  const slots = clubCategoryTileVariants();

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={slots.root({ className })}
      role="status"
    >
      <span aria-hidden className={slots.icon()}>
        <Skeleton className={slots.skeletonIcon()} />
      </span>
      <span className={slots.copy()}>
        <Skeleton aria-hidden className={slots.skeletonTitle()} />
        <Skeleton aria-hidden className={slots.skeletonSubtitle()} />
      </span>
    </div>
  );
}
