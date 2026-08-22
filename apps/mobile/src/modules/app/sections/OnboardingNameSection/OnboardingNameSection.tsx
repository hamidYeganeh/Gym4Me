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
    <form
      autoComplete="off"
      className={styles.root({ className })}
      onSubmit={(event) => event.preventDefault()}
    >
      <div className={styles.fields()}>
        <TextField
          aria-label={firstNameLabel}
          autoComplete="given-name"
          className={styles.field()}
          fullWidth
          name="given-name"
          value={firstName}
          onChange={onFirstNameChange}
        >
          <Input
            autoComplete="given-name"
            className={styles.input()}
            placeholder={firstNamePlaceholder}
          />
        </TextField>

        <TextField
          aria-label={lastNameLabel}
          autoComplete="family-name"
          className={styles.field()}
          fullWidth
          name="family-name"
          value={lastName}
          onChange={onLastNameChange}
        >
          <Input
            autoComplete="family-name"
            className={styles.input()}
            placeholder={lastNamePlaceholder}
          />
        </TextField>
      </div>

      <div className={styles.hintBlock()}>
        <IdentityCard1 aria-hidden className={styles.hintIcon()} size={28} />
        <Typography className={styles.hint()}>{hint}</Typography>
      </div>
    </form>
  );
}
