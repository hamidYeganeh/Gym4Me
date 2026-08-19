"use client";

import { Skeleton } from "@heroui/react/skeleton";
import { coachCardVariants } from "./CoachCard.styles";
import type { CoachCardVariant } from "./CoachCard.types";

export type CoachCardSkeletonProps = {
  variant?: CoachCardVariant;
  className?: string;
};

/** Layout-faithful skeleton for {@link CoachCard}. */
export function CoachCardSkeleton({
  variant = "default",
  className,
}: CoachCardSkeletonProps) {
  const slots = coachCardVariants({ variant });

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
        <Skeleton aria-hidden className="relative z-10 h-7 w-20 rounded-full" />
        <Skeleton aria-hidden className="relative z-10 size-9 rounded-full" />
      </div>
      <div className={slots.body()}>
        <Skeleton aria-hidden className="relative z-10 h-7 w-4/5 rounded-lg" />
        <Skeleton aria-hidden className="relative z-10 h-4 w-2/5 rounded-md" />
        <Skeleton aria-hidden className="relative z-10 h-4 w-24 rounded-md" />
        <Skeleton aria-hidden className="relative z-10 h-4 w-32 rounded-md" />
        <div className={slots.author()}>
          <Skeleton aria-hidden className="relative z-10 size-7 rounded-full" />
          <Skeleton aria-hidden className="relative z-10 h-4 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
}
