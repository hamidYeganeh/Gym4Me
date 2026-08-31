"use client";

import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { Typography } from "@heroui/react/typography";
import { MediaImage } from "../../common/MediaImage";
import { popularLocationCardVariants } from "./PopularLocationCard.styles";
import type { PopularLocationCardProps } from "./PopularLocationCard.types";

function resolveActionLabel(
  actionLabel: PopularLocationCardProps["actionLabel"],
  name: PopularLocationCardProps["name"],
) {
  if (actionLabel != null && actionLabel !== "") return actionLabel;
  if (typeof name === "string" || typeof name === "number") {
    return String(name);
  }
  return undefined;
}

export function PopularLocationCard({
  image,
  imageAlt = "",
  eyebrow,
  name,
  countLabel,
  actionLabel,
  onPress,
  className,
  ...props
}: PopularLocationCardProps) {
  const pressable = onPress != null;
  const slots = popularLocationCardVariants({ pressable });
  const resolvedActionLabel = resolveActionLabel(actionLabel, name);
  const showCount = countLabel != null && countLabel !== "";

  return (
    <Card
      className={slots.root({ className })}
      variant="transparent"
      {...props}
    >
      <div className={slots.media()}>
        <MediaImage
          alt={imageAlt}
          className={slots.image()}
          image={image}
          sizes="72px"
        />
      </div>

      <div className={slots.body()}>
        <Typography className={slots.eyebrow()} type="body-xs">
          {eyebrow}
        </Typography>
        <Typography className={slots.name()} type="body" weight="bold">
          {name}
        </Typography>
        {showCount ? (
          <Typography className={slots.count()} type="body-xs">
            {countLabel}
          </Typography>
        ) : null}
      </div>

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
