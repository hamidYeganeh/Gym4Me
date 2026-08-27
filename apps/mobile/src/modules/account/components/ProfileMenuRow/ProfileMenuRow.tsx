"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { profileMenuRowVariants } from "./ProfileMenuRow.styles";
import type { ProfileMenuRowProps } from "./ProfileMenuRow.types";

export function ProfileMenuRow({
  icon,
  label,
  hint,
  badge,
  trailing,
  showChevron = true,
  tone = "default",
  isDisabled = false,
  onPress,
  className,
  ...props
}: ProfileMenuRowProps) {
  const styles = profileMenuRowVariants({ tone, isDisabled });
  const canPress = Boolean(onPress) && !isDisabled;

  const content = (
    <>
      <span aria-hidden className={styles.icon()}>
        {icon}
      </span>
      <span className={styles.body()}>
        <Typography className={styles.label()} type="body" weight="medium">
          {label}
        </Typography>
        {hint ? (
          <Typography className={styles.hint()} type="body-sm">
            {hint}
          </Typography>
        ) : null}
      </span>
      <span className={styles.trailing()}>
        {badge != null && badge !== "" ? (
          <span className={styles.badge()}>{badge}</span>
        ) : null}
        {trailing}
        {showChevron && !trailing && canPress ? (
          <ChevronRight className={styles.chevron()} size={18} />
        ) : null}
      </span>
    </>
  );

  if (canPress) {
    return (
      <Button
        className={styles.pressable({ className: styles.root({ className }) })}
        fullWidth
        onPress={onPress}
        variant="ghost"
      >
        {content}
      </Button>
    );
  }

  return (
    <div
      aria-disabled={isDisabled || undefined}
      className={styles.root({ className })}
      {...props}
    >
      {content}
    </div>
  );
}
