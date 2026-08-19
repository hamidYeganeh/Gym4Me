"use client";

import { Skeleton } from "@heroui/react/skeleton";
import { equipmentBrowseCardVariants } from "./EquipmentBrowseCard.styles";
import type { EquipmentBrowseCardSize } from "./EquipmentBrowseCard.types";

export type EquipmentBrowseCardSkeletonProps = {
  size?: EquipmentBrowseCardSize;
  className?: string;
};

/** Layout-faithful skeleton for {@link EquipmentBrowseCard}. */
export function EquipmentBrowseCardSkeleton({
  size = "md",
  className,
}: EquipmentBrowseCardSkeletonProps) {
  const slots = equipmentBrowseCardVariants({ size });

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
      <Skeleton aria-hidden className="relative z-10 h-4 w-16 rounded-md" />
    </div>
  );
}
