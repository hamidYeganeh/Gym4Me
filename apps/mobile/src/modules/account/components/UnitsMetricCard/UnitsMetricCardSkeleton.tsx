"use client";

import { Skeleton } from "@heroui/react/skeleton";
import { unitsMetricCardVariants } from "./UnitsMetricCard.styles";

export function UnitsMetricCardSkeleton() {
  const styles = unitsMetricCardVariants();

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={styles.trigger({ className: "pointer-events-none" })}
      role="status"
    >
      <Skeleton aria-hidden className="size-[22px] rounded-md" />
      <Skeleton aria-hidden className="h-4 w-24 rounded-md" />
      <Skeleton aria-hidden className="h-3.5 w-16 rounded-md" />
    </div>
  );
}
