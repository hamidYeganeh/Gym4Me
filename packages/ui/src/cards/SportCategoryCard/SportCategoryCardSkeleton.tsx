"use client";

import { Skeleton } from "@heroui/react/skeleton";
import { sportCategoryCardVariants } from "./SportCategoryCard.styles";

export type SportCategoryCardSkeletonProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

/** Layout-faithful skeleton for {@link SportCategoryCard}. */
export function SportCategoryCardSkeleton({
  size = "md",
  className,
}: SportCategoryCardSkeletonProps) {
  const slots = sportCategoryCardVariants({ size });

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={slots.root({
        className: ["border border-border bg-surface", className]
          .filter(Boolean)
          .join(" "),
      })}
      role="status"
    >
      <Skeleton aria-hidden className="absolute inset-0 rounded-[inherit]" />
      <div className={slots.body()}>
        <Skeleton
          aria-hidden
          className="relative z-10 size-12 shrink-0 self-end rounded-full"
        />
        <div className={slots.content()}>
          <Skeleton aria-hidden className="relative z-10 mb-1 size-8 rounded-md" />
          <Skeleton aria-hidden className="relative z-10 h-3.5 w-16 rounded-md" />
          <Skeleton aria-hidden className="relative z-10 mt-1 h-6 w-28 rounded-md" />
        </div>
      </div>
    </div>
  );
}
