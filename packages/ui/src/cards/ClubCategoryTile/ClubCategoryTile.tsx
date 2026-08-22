"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { clubCategoryTileVariants } from "./ClubCategoryTile.styles";
import type { ClubCategoryTileProps } from "./ClubCategoryTile.types";

export function ClubCategoryTile({
  icon,
  title,
  subtitle,
  actionLabel,
  className,
  ...props
}: ClubCategoryTileProps) {
  const slots = clubCategoryTileVariants();
  const ariaLabel =
    actionLabel ?? (typeof title === "string" ? title : undefined);

  return (
    <Button
      {...props}
      aria-label={ariaLabel}
      className={slots.root({ className })}
      variant="tertiary"
    >
      <span aria-hidden className={slots.icon()}>
        {icon}
      </span>
      <span className={slots.copy()}>
        <Typography className={slots.title()} type="body-sm" weight="bold">
          {title}
        </Typography>
        {subtitle != null && subtitle !== "" ? (
          <Typography className={slots.subtitle()} color="muted" type="body-xs">
            {subtitle}
          </Typography>
        ) : null}
      </span>
    </Button>
  );
}
