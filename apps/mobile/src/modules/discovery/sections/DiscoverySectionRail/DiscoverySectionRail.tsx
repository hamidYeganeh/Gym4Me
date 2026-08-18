"use client";

import { Link } from "@heroui/react/link";
import { Typography } from "@heroui/react/typography";
import { discoverySectionRailVariants } from "./DiscoverySectionRail.styles";
import type { DiscoverySectionRailProps } from "./DiscoverySectionRail.types";

export function DiscoverySectionRail({
  title,
  hint,
  ariaLabel,
  seeAllLabel,
  onSeeAll,
  children,
  scrollerClassName,
  accent = true,
  titleSize = "h3",
  className,
}: DiscoverySectionRailProps) {
  const slots = discoverySectionRailVariants({ accent, titleSize });

  return (
    <section className={slots.root({ className })}>
      <div className={slots.header()}>
        <div className={slots.titleRow()}>
          {accent ? <span aria-hidden className={slots.accent()} /> : null}
          <div className={slots.titleBlock()}>
            <Typography
              className={slots.title()}
              type={titleSize}
              weight="bold"
            >
              {title}
            </Typography>
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
      <div
        aria-label={ariaLabel}
        className={scrollerClassName ?? slots.scroller()}
      >
        {children}
      </div>
    </section>
  );
}
