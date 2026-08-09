"use client";

import { ProgressiveBlur } from "../ProgressiveBlur";
import { stickyBottomActionsVariants } from "./StickyBottomActions.styles";
import type { StickyBottomActionsProps } from "./StickyBottomActions.types";

export function StickyBottomActions({
  children,
  className,
  contentClassName,
  ...props
}: StickyBottomActionsProps) {
  const slots = stickyBottomActionsVariants();

  return (
    <div className={slots.root({ className })} {...props}>
      <ProgressiveBlur
        blurIntensity={0.85}
        blurLayers={12}
        className={slots.blur()}
        direction="bottom"
      />
      <div className={slots.content({ className: contentClassName })}>
        {children}
      </div>
    </div>
  );
}
