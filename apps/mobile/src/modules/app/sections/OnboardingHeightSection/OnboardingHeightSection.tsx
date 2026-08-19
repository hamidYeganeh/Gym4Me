"use client";

import NumberFlow from "@number-flow/react";
import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { HeightSlider } from "@repo/ui/kit/HeightSlider";
import {
  ONBOARDING_HEIGHT_CM_RANGE,
  ONBOARDING_HEIGHT_IN_RANGE,
} from "@/modules/app/lib/onboarding-data";
import {
  displayHeight,
  inchesToCm,
} from "@/modules/app/lib/onboarding-units";
import { onboardingHeightSectionVariants } from "./OnboardingHeightSection.styles";
import type { OnboardingHeightSectionProps } from "./OnboardingHeightSection.types";

export function OnboardingHeightSection({
  label,
  unit,
  heightCm,
  unitOptions,
  onUnitChange,
  onHeightCmChange,
  className,
}: OnboardingHeightSectionProps) {
  const base = onboardingHeightSectionVariants();
  const display = displayHeight(heightCm, unit);
  const range =
    unit === "cm" ? ONBOARDING_HEIGHT_CM_RANGE : ONBOARDING_HEIGHT_IN_RANGE;
  const unitLabel =
    unitOptions.find((option) => option.id === unit)?.label ?? unit;

  return (
    <div className={base.root({ className })} data-onboarding-nested-scroll>
      <div aria-label={label} className={base.unitTrack()} role="group">
        {unitOptions.map((option) => {
          const selected = option.id === unit;
          const styles = onboardingHeightSectionVariants({ selected });
          return (
            <Button
              key={option.id}
              aria-pressed={selected}
              className={styles.unitItem()}
              variant="ghost"
              onPress={() => onUnitChange(option.id)}
            >
              {option.label}
            </Button>
          );
        })}
      </div>

      <div className={base.valueRow()}>
        <NumberFlow
          className={base.value()}
          locales="en-US"
          style={{ color: "var(--foreground)" }}
          value={display}
        />
        <Typography className={base.unit()}>{unitLabel}</Typography>
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
