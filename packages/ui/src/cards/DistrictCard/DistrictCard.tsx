"use client";

import { Button, Card, Typography } from "@heroui/react";
import { MediaImage } from "../../common/MediaImage";
import { districtCardVariants } from "./DistrictCard.styles";
import type { DistrictCardProps, DistrictCardSize } from "./DistrictCard.types";

const TITLE_TYPE: Record<DistrictCardSize, "h3" | "h2" | "h1"> = {
  sm: "h3",
  md: "h2",
  lg: "h1",
};

const SUBTITLE_TYPE: Record<
  DistrictCardSize,
  "body-xs" | "body-sm" | "body"
> = {
  sm: "body-xs",
  md: "body-sm",
  lg: "body",
};

function resolveActionLabel(
  actionLabel: DistrictCardProps["actionLabel"],
  title: DistrictCardProps["title"],
) {
  if (actionLabel != null && actionLabel !== "") return actionLabel;
  if (typeof title === "string" || typeof title === "number") {
    return String(title);
  }
  return undefined;
}

export function DistrictCard({
  image,
  imageAlt = "",
  title,
  subtitle,
  size = "md",
  actionLabel,
  onPress,
  imageClassName,
  className,
  ...props
}: DistrictCardProps) {
  const pressable = onPress != null;
  const slots = districtCardVariants({ size, pressable });
  const resolvedActionLabel = resolveActionLabel(actionLabel, title);
  const showSubtitle = subtitle != null && subtitle !== "";

  return (
    <Card
      className={slots.root({ className })}
      data-size={size}
      variant="transparent"
      {...props}
    >
      <div className={slots.media()}>
        <MediaImage
          alt={imageAlt}
          className={slots.image({ className: imageClassName })}
          image={image}
          sizes="(max-width: 768px) 50vw, 280px"
        />
        <div aria-hidden className={slots.scrim()} />
      </div>

      <Card.Footer className={slots.footer()}>
        <Typography
          className={slots.title()}
          type={TITLE_TYPE[size]}
          weight="bold"
        >
          {title}
        </Typography>
        {showSubtitle ? (
          <Typography
            className={slots.subtitle()}
            type={SUBTITLE_TYPE[size]}
            weight="normal"
          >
            {subtitle}
          </Typography>
        ) : null}
      </Card.Footer>

      {pressable ? (
        <Button
          aria-label={resolvedActionLabel}
          className={slots.pressTarget()}
          onPress={onPress}
          variant="ghost"
        />
      ) : null}
    </Card>
  );
}
