"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { appSectionHeaderVariants } from "./AppSectionHeader.styles";
import type { AppSectionHeaderProps } from "./AppSectionHeader.types";

export function AppSectionHeader({
  id,
  title,
  description,
  actionLabel,
  actionAriaLabel,
  onAction,
  className,
}: AppSectionHeaderProps) {
  const slots = appSectionHeaderVariants();

  return (
    <div className={slots.root({ className })}>
      <div className={slots.content()}>
        <Typography
          className={slots.title()}
          id={id}
          type="h4"
          weight="bold"
        >
          {title}
        </Typography>
        {description != null ? (
          <Typography className={slots.description()} type="body-sm">
            {description}
          </Typography>
        ) : null}
      </div>

      {actionLabel != null && onAction ? (
        <Button
          aria-label={actionAriaLabel}
          className={slots.action()}
          onPress={onAction}
          variant="ghost"
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
