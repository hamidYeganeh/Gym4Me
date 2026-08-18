"use client";

import type { ComponentType } from "react";
import { Button } from "@heroui/react/button";
import { Description } from "@heroui/react/description";
import { TextArea } from "@heroui/react/textarea";
import { TextField } from "@heroui/react/textfield";
import { GenderFemale } from "@repo/icons/GenderFemale";
import { GenderMale } from "@repo/icons/GenderMale";
import { GenderTransgender } from "@repo/icons/GenderTransgender";
import type { OnboardingGenderId } from "@/modules/app/lib/onboarding-data";
import { onboardingGenderSectionVariants } from "./OnboardingGenderSection.styles";
import type { OnboardingGenderSectionProps } from "./OnboardingGenderSection.types";

const GENDER_ICONS: Record<
  OnboardingGenderId,
  ComponentType<{ className?: string; size?: number; "aria-hidden"?: boolean }>
> = {
  male: GenderMale,
  female: GenderFemale,
  other: GenderTransgender,
};

export function OnboardingGenderSection({
  options,
  value,
  otherValue,
  otherPlaceholder,
  otherMax,
  onChange,
  onOtherChange,
  className,
}: OnboardingGenderSectionProps) {
  const base = onboardingGenderSectionVariants();

  return (
    <div className={base.root({ className })}>
      <div className={base.grid()} role="group">
        {options.map((option) => {
          const selected = value === option.id;
          const styles = onboardingGenderSectionVariants({ selected });
          const Icon = GENDER_ICONS[option.id];

          return (
            <div className={styles.option()} key={option.id}>
              <Button
                aria-label={option.label}
                aria-pressed={selected}
                className={styles.pill()}
                variant="ghost"
                onPress={() => onChange(option.id)}
              >
                <Icon aria-hidden className={styles.icon()} size={28} />
              </Button>
              <span className={styles.label()}>{option.label}</span>
            </div>
          );
        })}
      </div>

      {value === "other" ? (
        <TextField
          aria-label={otherPlaceholder}
          className={base.field()}
          fullWidth
          name="genderOther"
          value={otherValue}
          onChange={(next) => onOtherChange(next.slice(0, otherMax))}
        >
          <TextArea
            className={base.textarea()}
            maxLength={otherMax}
            placeholder={otherPlaceholder}
          />
          <Description className={base.counter()}>
            {otherValue.length}/{otherMax}
          </Description>
        </TextField>
      ) : null}
    </div>
  );
}
