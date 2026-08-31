"use client";

import { Skeleton } from "@heroui/react/skeleton";
import { popularLocationCardVariants } from "./PopularLocationCard.styles";

export type PopularLocationCardSkeletonProps = {
  className?: string;
};

export function PopularLocationCardSkeleton({
  className,
}: PopularLocationCardSkeletonProps) {
  const slots = popularLocationCardVariants();

  return (
    <div aria-hidden className={slots.root({ className })}>
      <Skeleton className={slots.media()} />
      <div className={slots.body()}>
        <Skeleton className="h-3 w-16 rounded-md" />
        <Skeleton className="mt-1 h-4 w-24 rounded-md" />
        <Skeleton className="mt-1 h-3 w-20 rounded-md" />
      </div>
    </div>
  );
}
