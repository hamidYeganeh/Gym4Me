"use client";

import { Skeleton } from "@heroui/react/skeleton";
import { coachMapCardVariants } from "./CoachMapCard.styles";

export type CoachMapCardSkeletonProps = {
  className?: string;
};

/** Layout-faithful skeleton for {@link CoachMapCard}. */
export function CoachMapCardSkeleton({ className }: CoachMapCardSkeletonProps) {
  const slots = coachMapCardVariants();

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={slots.root({ className })}
      role="status"
    >
      <div className={slots.row()}>
        <Skeleton aria-hidden className="size-14 shrink-0 rounded-full" />
        <div className={slots.content()}>
          <Skeleton aria-hidden className="h-5 w-36 rounded-md" />
          <Skeleton aria-hidden className="h-4 w-48 rounded-md" />
          <div className={slots.meta()}>
            <Skeleton aria-hidden className="h-4 w-20 rounded-md" />
            <Skeleton aria-hidden className="h-4 w-16 rounded-md" />
          </div>
          <Skeleton aria-hidden className="h-4 w-24 rounded-md" />
        </div>
      </div>
      <div className={slots.actions()}>
        <Skeleton aria-hidden className="h-12 w-full rounded-2xl" />
        <Skeleton aria-hidden className="h-12 w-full rounded-2xl" />
      </div>
    </div>
  );
}
