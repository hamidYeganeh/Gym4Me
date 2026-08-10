"use client";

import type { ComponentType } from "react";
import { Button, Typography } from "@heroui/react";
import {
  BreadToast,
  ChickenDrumstick,
  ForkKnife,
  Leaf,
} from "@repo/icons";
import type { OnboardingDietId } from "@/modules/app/lib/onboarding-data";
import { onboardingDietSectionVariants } from "./OnboardingDietSection.styles";
import type { OnboardingDietSectionProps } from "./OnboardingDietSection.types";

const DIET_ICONS: Record<
  OnboardingDietId,
  ComponentType<{ className?: string; size?: number; "aria-hidden"?: boolean }>
> = {
  balanced: ForkKnife,
  vegetarian: Leaf,
  protein: ChickenDrumstick,
  glutenFree: BreadToast,
};

export function OnboardingDietSection({
  label,
  options,
  value,
  onChange,
  className,
}: OnboardingDietSectionProps) {
  const base = onboardingDietSectionVariants();

  return (
    <div className={base.root({ className })}>
      <div aria-label={label} className={base.grid()} role="group">
        {options.map((option) => {
          const selected = option.id === value;
          const styles = onboardingDietSectionVariants({ selected });
          const Icon = DIET_ICONS[option.id];

          return (
            <Button
              key={option.id}
              aria-pressed={selected}
              className={styles.card()}
              variant="ghost"
              onPress={() => onChange(option.id)}
            >
              <Icon aria-hidden className={styles.icon()} size={28} />
              <Typography className={styles.title()}>{option.title}</Typography>
              <Typography className={styles.description()}>
                {option.description}
              </Typography>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
