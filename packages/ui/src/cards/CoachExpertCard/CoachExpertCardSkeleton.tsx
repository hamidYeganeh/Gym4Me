"use client";

import { Skeleton } from "@heroui/react/skeleton";
import { coachExpertCardVariants } from "./CoachExpertCard.styles";

export type CoachExpertCardSkeletonProps = {
  className?: string;
};

/** Layout-faithful skeleton for {@link CoachExpertCard}. */
export function CoachExpertCardSkeleton({
  className,
}: CoachExpertCardSkeletonProps) {
  const slots = coachExpertCardVariants();

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={slots.root({ className })}
      role="status"
    >
      <Skeleton aria-hidden className="size-[88px] rounded-full" />
      <Skeleton aria-hidden className="h-4 w-16 rounded-md" />
    </div>
  );
}
