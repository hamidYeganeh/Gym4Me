"use client";

import { Button } from "@heroui/react";
import { HeightSlider } from "@repo/ui/kit/HeightSlider";
import {
  ONBOARDING_HEIGHT_CM_RANGE,
  ONBOARDING_HEIGHT_IN_RANGE,
} from "@/modules/app/lib/onboarding-data";
import {
  displayHeight,
  inchesToCm,
  type OnboardingHeightUnit,
} from "@/modules/app/lib/onboarding-units";
import { onboardingHeightSectionVariants } from "./OnboardingHeightSection.styles";
import type { OnboardingHeightSectionProps } from "./OnboardingHeightSection.types";

export function OnboardingHeightSection({
  label,
  unit,
  heightCm,
  unitCmLabel,
  unitFtLabel,
  onUnitChange,
  onHeightCmChange,
  className,
}: OnboardingHeightSectionProps) {
  const base = onboardingHeightSectionVariants();
  const display = displayHeight(heightCm, unit);
  const range =
    unit === "cm" ? ONBOARDING_HEIGHT_CM_RANGE : ONBOARDING_HEIGHT_IN_RANGE;

  return (
    <div className={base.root({ className })} data-onboarding-nested-scroll>
      <div aria-label={label} className={base.unitTrack()} role="group">
        {(["ft", "cm"] as const).map((option) => {
          const selected = option === unit;
          const styles = onboardingHeightSectionVariants({ selected });
          return (
            <Button
              key={option}
              aria-pressed={selected}
              className={styles.unitItem()}
              variant="ghost"
              onPress={() => onUnitChange(option)}
            >
              {option === "cm" ? unitCmLabel : unitFtLabel}
            </Button>
          );
        })}
      </div>

      <HeightSlider
        aria-label={label}
        className={base.slider()}
        max={range.max}
        min={range.min}
        value={display}
        onChange={(next) => {
          onHeightCmChange(unit === "cm" ? next : inchesToCm(next));
        }}
      />
    </div>
  );
}
