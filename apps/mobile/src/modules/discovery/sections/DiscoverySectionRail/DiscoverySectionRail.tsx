"use client";

import { Link } from "@heroui/react/link";
import { Typography } from "@heroui/react/typography";
import { Sparkle1 } from "@repo/icons/Sparkle1";
import { useId } from "react";
import { DiscoverySectionCarousel } from "../DiscoverySectionCarousel";
import { discoverySectionRailVariants } from "./DiscoverySectionRail.styles";
import type { DiscoverySectionRailProps } from "./DiscoverySectionRail.types";

const ACCENT_ICON_SIZE = 20;

function DiscoverySheetPattern({ className }: { className?: string }) {
  const pid = `discovery-sheet-${useId().replace(/:/g, "")}`;

  return (
    <svg aria-hidden className={className}>
      <defs>
        <pattern
          height="168"
          id={pid}
          patternUnits="userSpaceOnUse"
          width="168"
        >
          <g
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          >
            <path d="M18 32v12M24 28v20M28 38h20M48 28v20M54 32v12" />
            <circle cx="122" cy="36" r="13" />
            <path d="M122 29v9l6 3" />
            <g transform="translate(16 98) rotate(-28)">
              <path d="M0 8v10M6 4v18M10 13h18M28 4v18M34 8v10" />
            </g>
            <circle cx="128" cy="124" r="11" />
            <path d="M128 118v7l5 2.5" />
            <path d="M78 78v8M83 75v14M87 82h14M101 75v14M106 78v8" />
            <circle cx="56" cy="78" r="8" />
            <path d="M56 74v5l3 1.5" />
          </g>
        </pattern>
      </defs>
      <rect fill={`url(#${pid})`} height="100%" width="100%" />
    </svg>
  );
}

export function DiscoverySectionRail({
  title,
  hint,
  ariaLabel,
  seeAllLabel,
  onSeeAll,
  children,
  scrollerClassName,
  swiperClassName,
  slideClassName,
  spaceBetween,
  accent = true,
  accentIcon,
  titleSize = "h3",
  className,
  sheet = false,
  tone = "surface",
  pattern = false,
}: DiscoverySectionRailProps) {
  const slots = discoverySectionRailVariants({
    accent,
    titleSize,
    sheet,
    tone: sheet ? tone : undefined,
  });

  return (
    <section className={slots.root({ className })}>
      {sheet && pattern ? (
        <DiscoverySheetPattern className={slots.pattern()} />
      ) : null}
      {title || hint || (seeAllLabel && onSeeAll) ? (
        <div className={slots.header()}>
          <div className={slots.titleRow()}>
            {accent && title ? (
              <span aria-hidden className={slots.accent()}>
                {accentIcon ?? <Sparkle1 size={ACCENT_ICON_SIZE} />}
              </span>
            ) : null}
            <div className={slots.titleBlock()}>
              {title ? (
                <Typography
                  className={slots.title()}
                  type={titleSize}
                  weight="bold"
                >
                  {title}
                </Typography>
              ) : null}
              {hint ? (
                <Typography className={slots.hint()} type="body-xs">
                  {hint}
                </Typography>
              ) : null}
            </div>
          </div>
          {seeAllLabel && onSeeAll ? (
            <Link className={slots.seeAll()} onPress={onSeeAll}>
              {seeAllLabel}
            </Link>
          ) : null}
        </div>
      ) : null}
      <div className={scrollerClassName ?? slots.scroller()}>
        <DiscoverySectionCarousel
          ariaLabel={ariaLabel}
          className={swiperClassName}
          slideClassName={slideClassName}
          spaceBetween={spaceBetween}
        >
          {children}
        </DiscoverySectionCarousel>
      </div>
    </section>
  );
}
