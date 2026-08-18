"use client";

import { Input } from "@heroui/react/input";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { IdentityCard1 } from "@repo/icons/IdentityCard1";
import { onboardingNameSectionVariants } from "./OnboardingNameSection.styles";
import type { OnboardingNameSectionProps } from "./OnboardingNameSection.types";

export function OnboardingNameSection({
  label,
  placeholder,
  hint,
  value,
  onChange,
  className,
}: OnboardingNameSectionProps) {
  const styles = onboardingNameSectionVariants();

  return (
    <div className={styles.root({ className })}>
      <TextField
        aria-label={label}
        className={styles.field()}
        fullWidth
        name="fullName"
        value={value}
        onChange={onChange}
      >
        <Input className={styles.input()} placeholder={placeholder} />
      </TextField>

      <div className={styles.hintBlock()}>
        <IdentityCard1 aria-hidden className={styles.hintIcon()} size={28} />
        <Typography className={styles.hint()}>{hint}</Typography>
      </div>
    </div>
  );
}
