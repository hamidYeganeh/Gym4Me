"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { MediaImage } from "../../common/MediaImage";
import { equipmentBrowseCardVariants } from "./EquipmentBrowseCard.styles";
import type { EquipmentBrowseCardProps } from "./EquipmentBrowseCard.types";

export function EquipmentBrowseCard({
  title,
  image,
  imageAlt = "",
  size = "md",
  className,
  ...props
}: EquipmentBrowseCardProps) {
  const slots = equipmentBrowseCardVariants({ size });

  return (
    <Button
      {...props}
      aria-label={typeof title === "string" ? title : undefined}
      className={slots.root({ className })}
      variant="ghost"
    >
      <MediaImage
        alt={imageAlt}
        aria-hidden={imageAlt === ""}
        className={slots.image()}
        image={image}
        sizes="(max-width: 768px) 45vw, 200px"
      />
      <span aria-hidden className={slots.scrim()} />
      <Typography className={slots.label()} type="body-sm" weight="bold">
        {title}
      </Typography>
    </Button>
  );
}
