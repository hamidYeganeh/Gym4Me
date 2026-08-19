"use client";

import { Input } from "@heroui/react/input";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { IdentityCard1 } from "@repo/icons/IdentityCard1";
import { onboardingNameSectionVariants } from "./OnboardingNameSection.styles";
import type { OnboardingNameSectionProps } from "./OnboardingNameSection.types";

export function OnboardingNameSection({
  firstNameLabel,
  lastNameLabel,
  firstNamePlaceholder,
  lastNamePlaceholder,
  hint,
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  className,
}: OnboardingNameSectionProps) {
  const styles = onboardingNameSectionVariants();

  return (
    <div className={styles.root({ className })}>
      <div className={styles.fields()}>
        <TextField
          aria-label={firstNameLabel}
          className={styles.field()}
          fullWidth
          name="firstName"
          value={firstName}
          onChange={onFirstNameChange}
        >
          <Input className={styles.input()} placeholder={firstNamePlaceholder} />
        </TextField>

        <TextField
          aria-label={lastNameLabel}
          className={styles.field()}
          fullWidth
          name="lastName"
          value={lastName}
          onChange={onLastNameChange}
        >
          <Input className={styles.input()} placeholder={lastNamePlaceholder} />
        </TextField>
      </div>

      <div className={styles.hintBlock()}>
        <IdentityCard1 aria-hidden className={styles.hintIcon()} size={28} />
        <Typography className={styles.hint()}>{hint}</Typography>
      </div>
    </div>
  );
}
