"use client";

import { Button, Typography } from "@heroui/react";
import { ArrowRight } from "@repo/icons/ArrowRight";
import { PersonKarate } from "@repo/icons/PersonKarate";
import type { CSSProperties } from "react";
import { MediaImage } from "../../common/MediaImage";
import { sportCardVariants } from "./SportCard.styles";
import type { SportCardProps, SportCardSize } from "./SportCard.types";

const DEFAULT_COLOR = "#2563EB";
const DEFAULT_FOREGROUND = "#FFFFFF";
const DEFAULT_ACTION = "#000000";
const DEFAULT_OVERLAY_OPACITY = 0.55;

const ICON_SIZE: Record<SportCardSize, number> = {
  sm: 28,
  md: 40,
  lg: 48,
};

const ARROW_SIZE: Record<SportCardSize, number> = {
  sm: 16,
  md: 22,
  lg: 24,
};

const TITLE_TYPE: Record<SportCardSize, "h3" | "h2" | "h1"> = {
  sm: "h3",
  md: "h2",
  lg: "h1",
};

const SUBTITLE_TYPE: Record<SportCardSize, "body-xs" | "body-sm" | "body"> = {
  sm: "body-xs",
  md: "body-sm",
  lg: "body",
};

export function SportCard({
  sport,
  size = "md",
  actionLabel,
  color = DEFAULT_COLOR,
  foregroundColor = DEFAULT_FOREGROUND,
  actionColor = DEFAULT_ACTION,
  actionForegroundColor,
  backgroundImageClassName,
  overlayOpacity = DEFAULT_OVERLAY_OPACITY,
  actionClassName,
  className,
  style,
  onPress,
  ...props
}: SportCardProps) {
  const { title, subtitle, backgroundImage, icon } = sport;
  const slots = sportCardVariants({ size });
  const hasBackgroundImage = backgroundImage != null && backgroundImage !== "";
  const arrowColor = actionForegroundColor ?? foregroundColor;

  const rootStyle: CSSProperties = {
    backgroundColor: color,
    color: foregroundColor,
    // Keep HeroUI Button token hover/press from flashing the default surface.
    ["--button-bg" as string]: color,
    ["--button-bg-hover" as string]: color,
    ["--button-bg-pressed" as string]: color,
    ["--button-fg" as string]: foregroundColor,
    ...style,
  };

  return (
    <Button
      {...props}
      aria-label={actionLabel}
      className={slots.root({ className })}
      onPress={onPress}
      style={rootStyle}
      variant="ghost"
    >
      {hasBackgroundImage && backgroundImage != null ? (
        <MediaImage
          alt=""
          aria-hidden
          className={slots.backgroundImage({
            className: backgroundImageClassName,
          })}
          image={backgroundImage}
          sizes="(max-width: 768px) 50vw, 240px"
        />
      ) : null}

      {hasBackgroundImage ? (
        <div
          aria-hidden
          className={slots.overlay()}
          style={{ backgroundColor: color, opacity: overlayOpacity }}
        />
      ) : null}

      <div className={slots.body()}>
        <div className={slots.content()}>
          <span className={slots.icon()} aria-hidden>
            {icon ?? <PersonKarate size={ICON_SIZE[size]} />}
          </span>
          <Typography
            className={slots.subtitle()}
            type={SUBTITLE_TYPE[size]}
            weight="medium"
          >
            {subtitle}
          </Typography>
          <Typography
            className={slots.title()}
            type={TITLE_TYPE[size]}
            weight="bold"
          >
            {title}
          </Typography>
        </div>

        <span
          aria-hidden
          className={slots.action({ className: actionClassName })}
          style={{ backgroundColor: actionColor, color: arrowColor }}
        >
          <ArrowRight size={ARROW_SIZE[size]} />
        </span>
      </div>
    </Button>
  );
}
