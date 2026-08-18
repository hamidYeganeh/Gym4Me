"use client";

import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { Typography } from "@heroui/react/typography";
import { MediaImage } from "../../common/MediaImage";
import { cityCardVariants } from "./CityCard.styles";
import type { CityCardProps, CityCardSize } from "./CityCard.types";

const CITY_TYPE: Record<CityCardSize, "h3" | "h2" | "h1"> = {
  sm: "h3",
  md: "h2",
  lg: "h1",
};

export function CityCard({
  image,
  imageAlt = "",
  city,
  size = "md",
  actionLabel,
  onAction,
  imageClassName,
  actionClassName,
  className,
  ...props
}: CityCardProps) {
  const slots = cityCardVariants({ size });

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

      <div className={slots.body()}>
        <Typography
          className={slots.city()}
          type={CITY_TYPE[size]}
          weight="bold"
        >
          {city}
        </Typography>

        <div className={slots.footer()}>
          <Button
            className={slots.action({ className: actionClassName })}
            fullWidth
            onPress={onAction}
            size="sm"
            variant="primary"
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </Card>
  );
}
