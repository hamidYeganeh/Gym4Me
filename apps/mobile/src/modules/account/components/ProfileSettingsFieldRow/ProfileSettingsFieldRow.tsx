"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ChevronDown } from "@repo/icons/ChevronDown";
import { InfoCircle } from "@repo/icons/InfoCircle";
import { profileSettingsFieldRowVariants } from "./ProfileSettingsFieldRow.styles";
import type { ProfileSettingsFieldRowProps } from "./ProfileSettingsFieldRow.types";

const TRAILING_ICON = 18;

export function ProfileSettingsFieldRow({
  label,
  value,
  placeholder,
  icon,
  locked = false,
  lockedAriaLabel,
  multiline = false,
  valueDir,
  onPress,
  className,
}: ProfileSettingsFieldRowProps) {
  const styles = profileSettingsFieldRowVariants({ locked, multiline });
  const shown = value.trim();
  const content = (
    <>
      <span aria-hidden className={styles.icon()}>
        {icon}
      </span>
      <span
        className={shown ? styles.value() : styles.placeholder()}
        dir={valueDir}
      >
        {shown || placeholder}
      </span>
      {locked ? (
        <span
          aria-label={lockedAriaLabel}
          className={styles.help()}
          title={lockedAriaLabel}
        >
          <InfoCircle size={14} />
        </span>
      ) : (
        <ChevronDown
          aria-hidden
          className={styles.trailing()}
          size={TRAILING_ICON}
        />
      )}
    </>
  );

  return (
    <div className={styles.root({ className })}>
      <Typography className={styles.label()}>{label}</Typography>
      {locked || !onPress ? (
        <div className={styles.trigger()}>{content}</div>
      ) : (
        <Button
          className={styles.trigger()}
          onPress={onPress}
          type="button"
          variant="ghost"
        >
          {content}
        </Button>
      )}
    </div>
  );
}
