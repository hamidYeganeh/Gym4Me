"use client";

import { Skeleton } from "@heroui/react/skeleton";
import { achievementTagVariants } from "./AchievementTag.styles";
import type {
  AchievementTagSize,
  AchievementTagVariant,
} from "./AchievementTag.types";

export type AchievementTagSkeletonProps = {
  variant?: AchievementTagVariant;
  size?: AchievementTagSize;
  className?: string;
};

/** Layout-faithful skeleton for {@link AchievementTag}. */
export function AchievementTagSkeleton({
  variant = "polygon",
  size = "md",
  className,
}: AchievementTagSkeletonProps) {
  const slots = achievementTagVariants({ variant, size });

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={slots.root({ className })}
      data-size={size}
      data-variant={variant}
      role="status"
    >
      <Skeleton aria-hidden className="size-full rounded-[28%]" />
    </div>
  );
}
