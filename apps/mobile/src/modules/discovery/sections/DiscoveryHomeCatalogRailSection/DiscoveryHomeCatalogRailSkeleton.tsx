"use client";

import { Skeleton } from "@heroui/react/skeleton";
import { DiscoverySectionRail } from "../DiscoverySectionRail";
import type { DiscoverySectionSheetTone } from "../DiscoverySectionRail";
import { discoveryHomeCatalogRailSectionVariants } from "./DiscoveryHomeCatalogRailSection.styles";
import type { DiscoveryHomeCatalogRailVariant } from "./DiscoveryHomeCatalogRailSection.types";

type DiscoveryHomeCatalogRailSkeletonProps = {
  title: string;
  hint?: string;
  variant: DiscoveryHomeCatalogRailVariant;
  tone?: DiscoverySectionSheetTone;
  pattern?: boolean;
  count?: number;
};

function SkeletonBody({
  variant,
}: {
  variant: DiscoveryHomeCatalogRailVariant;
}) {
  if (variant === "tile") {
    return (
      <>
        <Skeleton aria-hidden className="size-10 rounded-xl" />
        <Skeleton aria-hidden className="h-4 w-24 rounded-md" />
        <Skeleton aria-hidden className="h-3 w-16 rounded-md" />
      </>
    );
  }
  if (variant === "schedule") {
    return (
      <>
        <Skeleton aria-hidden className="h-5 w-20 rounded-full" />
        <Skeleton aria-hidden className="mt-2 h-5 w-3/5 rounded-md" />
        <div className="mt-2 flex gap-2">
          <Skeleton aria-hidden className="h-4 w-24 rounded-md" />
          <Skeleton aria-hidden className="h-4 w-16 rounded-md" />
        </div>
      </>
    );
  }
  if (variant === "pricing") {
    return (
      <>
        <Skeleton aria-hidden className="h-4 w-20 rounded-md" />
        <Skeleton aria-hidden className="mt-2 h-6 w-4/5 rounded-lg" />
        <Skeleton aria-hidden className="mt-3 h-5 w-28 rounded-md" />
        <Skeleton aria-hidden className="mt-1 h-3 w-16 rounded-md" />
      </>
    );
  }
  return (
    <>
      <Skeleton aria-hidden className="h-4 w-20 rounded-md" />
      <Skeleton aria-hidden className="mt-2 h-6 w-4/5 rounded-lg" />
      <Skeleton aria-hidden className="mt-2 h-4 w-3/5 rounded-md" />
    </>
  );
}

export function DiscoveryHomeCatalogRailSkeleton({
  title,
  hint,
  variant,
  tone = "surface",
  pattern,
  count = variant === "schedule" ? 2 : 3,
}: DiscoveryHomeCatalogRailSkeletonProps) {
  const slots = discoveryHomeCatalogRailSectionVariants({ variant });

  return (
    <DiscoverySectionRail
      ariaLabel=""
      hint={hint}
      pattern={pattern}
      sheet
      title={title}
      tone={tone}
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          aria-busy="true"
          className={slots.card()}
          key={`${variant}-skeleton-${index}`}
          role="status"
        >
          {(variant === "portrait" || variant === "media") && (
            <Skeleton
              aria-hidden
              className="absolute inset-0 rounded-[inherit]"
            />
          )}
          <div className={slots.body()}>
            <SkeletonBody variant={variant} />
          </div>
        </div>
      ))}
    </DiscoverySectionRail>
  );
}
