"use client";

import type { ComponentType } from "react";
import { Button } from "@heroui/react/button";
import { GenderFemale } from "@repo/icons/GenderFemale";
import { GenderMale } from "@repo/icons/GenderMale";
import {
  getBodyTypeArt,
  type BodyTypeGender,
} from "@repo/ui/cards/BodyTypeCard";
import type { OnboardingGenderId } from "@/modules/app/lib/onboarding-data";
import { onboardingGenderSectionVariants } from "./OnboardingGenderSection.styles";
import type { OnboardingGenderSectionProps } from "./OnboardingGenderSection.types";

const GENDER_ICONS: Record<
  OnboardingGenderId,
  ComponentType<{ className?: string; size?: number; "aria-hidden"?: boolean }>
> = {
  male: GenderMale,
  female: GenderFemale,
};

function bodyGenderForOption(id: OnboardingGenderId): BodyTypeGender {
  return id;
}

export function OnboardingGenderSection({
  options,
  value,
  onChange,
  className,
}: OnboardingGenderSectionProps) {
  const base = onboardingGenderSectionVariants();

  return (
    <div className={base.root({ className })}>
      <div className={base.grid()} role="radiogroup">
        {options.map((option) => {
          const selected = value === option.id;
          const styles = onboardingGenderSectionVariants({ selected });
          const Icon = GENDER_ICONS[option.id];
          const bodyArt = getBodyTypeArt(
            "mesomorph",
            bodyGenderForOption(option.id),
          );

          return (
            <Button
              aria-checked={selected}
              aria-label={option.label}
              className={styles.card()}
              key={option.id}
              role="radio"
              variant="ghost"
              onPress={() => onChange(option.id)}
            >
              <span aria-hidden className={styles.figure()}>
                <span
                  className={styles.art()}
                  dangerouslySetInnerHTML={{ __html: bodyArt }}
                />
                <span className={styles.fade()} />
              </span>
              <Icon aria-hidden className={styles.icon()} size={32} />
              <span className={styles.label()}>{option.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
