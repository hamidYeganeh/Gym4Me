"use client";

import { Button, Card, Separator, Typography } from "@heroui/react";
import { Mobile } from "@repo/icons/Mobile";
import { User } from "@repo/icons/User";
import type { ReactNode } from "react";
import { coachConsultationTypeVariants } from "./CoachConsultationType.styles";
import type {
  CoachConsultationOption,
  CoachConsultationTypeKind,
  CoachConsultationTypeProps,
} from "./CoachConsultationType.types";

const ICON_SIZE = 20;

function defaultIcon(kind: CoachConsultationTypeKind): ReactNode {
  if (kind === "remote") {
    return <Mobile size={ICON_SIZE} />;
  }
  return <User size={ICON_SIZE} />;
}

export function CoachConsultationType({
  title,
  options,
  selectedId,
  onOptionPress,
  className,
  cardClassName,
  ...props
}: CoachConsultationTypeProps) {
  const slots = coachConsultationTypeVariants();
  const interactive = onOptionPress != null;

  return (
    <section className={slots.root({ className })}>
      <Typography className={slots.title()} type="body">
        {title}
      </Typography>

      <Card
        className={slots.card({ className: cardClassName })}
        variant="transparent"
        {...props}
      >
        <Card.Content className={slots.content()} role="list">
          {options.map((option, index) => {
            const isUnavailable = option.status === "unavailable";
            const isSelected = selectedId === option.id;
            const rowSlots = coachConsultationTypeVariants({
              status: option.status,
              selected: isSelected,
              interactive: interactive && !isUnavailable,
            });

            return (
              <div key={option.id}>
                {index > 0 ? (
                  <Separator className={slots.divider()} />
                ) : null}
                <OptionRow
                  interactive={interactive}
                  isUnavailable={isUnavailable}
                  onOptionPress={onOptionPress}
                  option={option}
                  slots={rowSlots}
                />
              </div>
            );
          })}
        </Card.Content>
      </Card>
    </section>
  );
}

function OptionRow({
  option,
  isUnavailable,
  interactive,
  onOptionPress,
  slots,
}: {
  option: CoachConsultationOption;
  isUnavailable: boolean;
  interactive: boolean;
  onOptionPress?: CoachConsultationTypeProps["onOptionPress"];
  slots: ReturnType<typeof coachConsultationTypeVariants>;
}) {
  const priceText = [option.pricePrefix, option.price, option.priceSuffix]
    .filter((part) => part != null && part !== "")
    .map(String)
    .join(" ");

  const content = (
    <>
      <span aria-hidden className={slots.iconWrap()}>
        {option.icon ?? defaultIcon(option.kind)}
      </span>
      <span className={slots.meta()}>
        <span className={slots.optionTitle()}>{option.title}</span>
        <span className={slots.statusLabel()}>{option.statusLabel}</span>
      </span>
      <span className={slots.priceGroup()}>
        {option.pricePrefix != null && option.pricePrefix !== "" ? (
          <span className={slots.pricePrefix()}>{option.pricePrefix}</span>
        ) : null}
        <span className={slots.price()}>{option.price}</span>
        {option.priceSuffix != null && option.priceSuffix !== "" ? (
          <span className={slots.priceSuffix()}>{option.priceSuffix}</span>
        ) : null}
      </span>
    </>
  );

  if (!interactive || isUnavailable) {
    return (
      <div
        aria-label={`${String(option.title)}, ${String(option.statusLabel)}, ${priceText}`}
        className={slots.row()}
        role="listitem"
      >
        {content}
      </div>
    );
  }

  return (
    <Button
      aria-label={`${String(option.title)}, ${String(option.statusLabel)}, ${priceText}`}
      className={slots.row()}
      onPress={() => onOptionPress?.(option)}
      variant="ghost"
    >
      {content}
    </Button>
  );
}
