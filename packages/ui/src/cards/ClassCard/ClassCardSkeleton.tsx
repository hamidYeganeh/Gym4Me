"use client";

import { Skeleton } from "@heroui/react/skeleton";
import { classCardVariants } from "./ClassCard.styles";
import type { ClassCardVariant } from "./ClassCard.types";

export type ClassCardSkeletonProps = {
  variant?: ClassCardVariant;
  className?: string;
};

/** Layout-faithful skeleton for {@link ClassCard}. */
export function ClassCardSkeleton({
  variant = "dark",
  className,
}: ClassCardSkeletonProps) {
  const slots = classCardVariants({ variant });

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={slots.root({
        className: ["border border-border bg-surface", className]
          .filter(Boolean)
          .join(" "),
      })}
      data-variant={variant}
      role="status"
    >
      <Skeleton aria-hidden className="absolute inset-0 rounded-[inherit]" />
      <div className={slots.topBar()}>
        <Skeleton aria-hidden className="relative z-10 h-6 w-20 rounded-full" />
        <Skeleton aria-hidden className="relative z-10 size-8 rounded-full" />
      </div>
      <div className={slots.body()}>
        <Skeleton aria-hidden className="relative z-10 h-8 w-4/5 rounded-lg" />
        <div className={slots.author()}>
          <Skeleton aria-hidden className="relative z-10 size-7 rounded-full" />
          <Skeleton aria-hidden className="relative z-10 h-4 w-28 rounded-md" />
        </div>
        <div className={slots.stats()}>
          <Skeleton
            aria-hidden
            className="relative z-10 h-10 w-16 rounded-md"
          />
          <Skeleton
            aria-hidden
            className="relative z-10 h-10 w-16 rounded-md"
          />
          <Skeleton
            aria-hidden
            className="relative z-10 h-10 w-16 rounded-md"
          />
        </div>
      </div>
    </div>
  );
}
