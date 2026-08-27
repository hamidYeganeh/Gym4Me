"use client";

import { useRouter } from "@/shared/lib/app-router";
import { DiscoverySectionRail } from "../DiscoverySectionRail";
import { discoveryHomeCatalogRailSectionVariants } from "./DiscoveryHomeCatalogRailSection.styles";
import type { DiscoveryHomeCatalogRailSectionProps } from "./DiscoveryHomeCatalogRailSection.types";

export function DiscoveryHomeCatalogRailSection({
  title,
  hint,
  seeAllHref,
  seeAllLabel = "مشاهده همه",
  seeAllVariant,
  items,
  tone = "surface",
  pattern,
  variant = "media",
}: DiscoveryHomeCatalogRailSectionProps) {
  const router = useRouter();
  const slots = discoveryHomeCatalogRailSectionVariants({ variant });
  if (items.length === 0) return null;

  return (
    <DiscoverySectionRail
      ariaLabel={title}
      hint={hint}
      pattern={pattern}
      seeAllLabel={seeAllHref ? seeAllLabel : undefined}
      seeAllVariant={seeAllVariant}
      sheet
      title={title}
      tone={tone}
      onSeeAll={seeAllHref ? () => router.push(seeAllHref) : undefined}
    >
      {items.map((item) => (
        <button
          aria-label={item.title}
          className={slots.card()}
          key={item.id}
          type="button"
          onClick={() => router.push(item.href)}
        >
          {item.image && (variant === "portrait" || variant === "media") ? (
            <img alt="" className={slots.image()} src={item.image} />
          ) : (
            <span aria-hidden className={slots.emptyImage()} />
          )}
          <span aria-hidden className={slots.overlay()} />
          <span className={slots.body()}>
            {item.eyebrow ? (
              <span className={slots.eyebrow()}>{item.eyebrow}</span>
            ) : null}
            <span className={slots.title()}>{item.title}</span>
            {item.meta ? (
              <span className={slots.meta()}>{item.meta}</span>
            ) : null}
          </span>
        </button>
      ))}
    </DiscoverySectionRail>
  );
}
