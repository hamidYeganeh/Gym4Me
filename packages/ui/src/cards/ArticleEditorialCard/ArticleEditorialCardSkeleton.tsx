"use client";

import { Skeleton } from "@heroui/react/skeleton";
import { articleEditorialCardVariants } from "./ArticleEditorialCard.styles";

export type ArticleEditorialCardSkeletonProps = {
  className?: string;
};

/** Layout-faithful skeleton for {@link ArticleEditorialCard}. */
export function ArticleEditorialCardSkeleton({
  className,
}: ArticleEditorialCardSkeletonProps) {
  const slots = articleEditorialCardVariants();

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={slots.root({ className })}
      role="status"
    >
      <Skeleton aria-hidden className={slots.skeletonChip()} />
      <Skeleton aria-hidden className={slots.skeletonDate()} />
      <Skeleton aria-hidden className={slots.skeletonTitle()} />
      <Skeleton aria-hidden className={slots.skeletonTitleLine()} />
      <div className={slots.footer()}>
        <div className={slots.meta()}>
          <Skeleton aria-hidden className={slots.skeletonMeta()} />
          <Skeleton aria-hidden className={slots.skeletonMetaShort()} />
        </div>
        <Skeleton aria-hidden className={slots.skeletonAction()} />
      </div>
    </div>
  );
}
