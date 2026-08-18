import type { ComponentType } from "react";
import type { IconProps } from "@repo/icons/create-icon";

type GlyphProps = {
  icon: ComponentType<IconProps>;
  size?: number;
  className?: string;
};

/** Drop-in replacement for locomotive `u-glyph` emoji spans. */
export function MarketingGlyph({
  icon: Icon,
  size = 28,
  className = "u-glyph",
}: GlyphProps) {
  return (
    <span className={`${className} u-marketing-glyph`} aria-hidden={true}>
      <Icon size={size} />
    </span>
  );
}
