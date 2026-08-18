"use client";

import { Skeleton } from "@heroui/react/skeleton";
import { workoutCardVariants } from "./WorkoutCard.styles";

export type WorkoutCardSkeletonProps = {
  className?: string;
};

/** Layout-faithful skeleton for {@link WorkoutCard}. */
export function WorkoutCardSkeleton({ className }: WorkoutCardSkeletonProps) {
  const slots = workoutCardVariants();

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={slots.root({
        className: ["border border-border", className].filter(Boolean).join(" "),
      })}
      role="status"
    >
      <Skeleton aria-hidden className="absolute inset-0 rounded-[inherit]" />
      <div className={slots.body()}>
        <Skeleton aria-hidden className="relative z-10 h-7 w-20 rounded-full" />
        <div className={slots.bottom()}>
          <div className={slots.info()}>
            <Skeleton aria-hidden className="relative z-10 h-5 w-32 rounded-md" />
            <Skeleton aria-hidden className="relative z-10 h-3.5 w-24 rounded-md" />
          </div>
          <Skeleton aria-hidden className="relative z-10 size-10 shrink-0 rounded-full" />
        </div>
      </div>
    </div>
  );
}
