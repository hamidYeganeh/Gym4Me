"use client";

import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { Check } from "@repo/icons/Check";
import { brandAwareText } from "../../kit/LineShadowText";
import { clubSubscriptionCardVariants } from "./ClubSubscriptionCard.styles";
import type { ClubSubscriptionCardProps } from "./ClubSubscriptionCard.types";

export function ClubSubscriptionCard({
  planName,
  price,
  priceSuffix,
  description,
  badge,
  actionLabel,
  onAction,
  selected = false,
  control,
  statusIcon,
  actionClassName,
  className,
  ...props
}: ClubSubscriptionCardProps) {
  const hasBadge = badge != null && badge !== "";
  const hasControl = control != null;
  const slots = clubSubscriptionCardVariants({
    hasBadge,
    hasControl,
    selected,
  });

  return (
    <Card
      className={slots.root({ className })}
      data-selected={selected || undefined}
      variant="transparent"
      {...props}
    >
      {hasBadge ? (
        <Chip
          className={slots.badge()}
          color="accent"
          size="sm"
          variant="primary"
        >
          <Chip.Label>{badge}</Chip.Label>
        </Chip>
      ) : null}

      <div className={slots.body()}>
        <Card.Header className={slots.content()}>
          {/*
            Opt out of RAC Text slots: when nested in Radio.Content, Typography
            would claim an invalid slot (Radio only allows "description").
          */}
          <Typography
            className={slots.planName()}
            // @ts-expect-error RAC slot opt-out (null clears inherited slot)
            slot={null}
            type="body"
            weight="bold"
          >
            {planName}
          </Typography>

          <div className={slots.priceRow()}>
            <Typography
              className={slots.price()}
              // @ts-expect-error RAC slot opt-out (null clears inherited slot)
              slot={null}
              type="h3"
              weight="bold"
            >
              {price}
            </Typography>
            {priceSuffix != null && priceSuffix !== "" ? (
              <Typography
                className={slots.priceSuffix()}
                // @ts-expect-error RAC slot opt-out (null clears inherited slot)
                slot={null}
                type="body"
              >
                {priceSuffix}
              </Typography>
            ) : null}
          </div>

          {description != null && description !== "" ? (
            <Typography
              className={slots.description()}
              // @ts-expect-error RAC slot opt-out (null clears inherited slot)
              slot={null}
              type="body"
            >
              {brandAwareText(description)}
            </Typography>
          ) : null}

          {actionLabel != null && actionLabel !== "" ? (
            <Button
              className={slots.action({ className: actionClassName })}
              onPress={onAction}
              variant="ghost"
            >
              {actionLabel}
            </Button>
          ) : null}
        </Card.Header>

        <span aria-hidden className={slots.status()}>
          {control ??
            (selected ? (statusIcon ?? <Check size={18} />) : null)}
        </span>
      </div>
    </Card>
  );
}
