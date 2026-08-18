"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ArrowRight } from "@repo/icons/ArrowRight";
import { MediaImage } from "../../common/MediaImage";
import { metricPromoCardVariants } from "./MetricPromoCard.styles";
import type { MetricPromoCardProps } from "./MetricPromoCard.types";

export function MetricPromoCard({
  title,
  actionLabel,
  image,
  imageAlt = "",
  onAction,
  actionClassName,
  imageClassName,
  className,
  ...props
}: MetricPromoCardProps) {
  const slots = metricPromoCardVariants();

  return (
    <div className={slots.root({ className })} {...props}>
      <div className={slots.content()}>
        <Typography className={slots.title()} weight="bold">
          {title}
        </Typography>
        <Button
          className={slots.action({ className: actionClassName })}
          onPress={onAction}
          variant="ghost"
        >
          <span>{actionLabel}</span>
          <ArrowRight aria-hidden className={slots.actionIcon()} size={16} />
        </Button>
      </div>

      <div aria-hidden={!imageAlt} className={slots.media()}>
        <MediaImage
          alt={imageAlt}
          className={slots.image({ className: imageClassName })}
          image={image}
          sizes="180px"
        />
      </div>
    </div>
  );
}
