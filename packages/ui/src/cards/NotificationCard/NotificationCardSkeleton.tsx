"use client";

import { Skeleton } from "@heroui/react/skeleton";
import { notificationCardVariants } from "./NotificationCard.styles";

export type NotificationCardSkeletonProps = {
  className?: string;
  /** Include progress bar placeholder. */
  showProgress?: boolean;
  /** Include media thumbnail placeholder. */
  showMedia?: boolean;
};

/** Layout-faithful skeleton for {@link NotificationCard}. */
export function NotificationCardSkeleton({
  className,
  showProgress = false,
  showMedia = false,
}: NotificationCardSkeletonProps) {
  const slots = notificationCardVariants({ align: "start" });

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={slots.root({ className })}
      role="status"
    >
      <Skeleton aria-hidden className="size-12 shrink-0 rounded-full" />
      <div className={slots.body()}>
        <div className={slots.header()}>
          <Skeleton aria-hidden className="h-5 w-40 rounded-md" />
          <Skeleton aria-hidden className="h-4 w-12 shrink-0 rounded-md" />
        </div>
        <Skeleton aria-hidden className="h-4 w-full rounded-md" />
        <Skeleton aria-hidden className="h-4 w-3/5 rounded-md" />
        {showProgress ? (
          <Skeleton aria-hidden className="mt-1 h-2 w-full rounded-full" />
        ) : null}
        {showMedia ? (
          <Skeleton aria-hidden className="mt-1 min-h-28 w-full rounded-2xl" />
        ) : null}
        <div className={slots.actions()}>
          <Skeleton aria-hidden className="h-4 w-20 rounded-md" />
          <Skeleton aria-hidden className="h-4 w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
}
