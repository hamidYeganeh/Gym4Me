"use client";

import NumberFlow from "@number-flow/react";
import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { WeightSlider } from "@repo/ui/kit/WeightSlider";
import {
  ONBOARDING_WEIGHT_KG_RANGE,
  ONBOARDING_WEIGHT_LBS_RANGE,
} from "@/modules/app/lib/onboarding-data";
import {
  displayWeight,
  lbsToKg,
} from "@/modules/app/lib/onboarding-units";
import { onboardingWeightSectionVariants } from "./OnboardingWeightSection.styles";
import type { OnboardingWeightSectionProps } from "./OnboardingWeightSection.types";

export function OnboardingWeightSection({
  label,
  unit,
  weightKg,
  unitOptions,
  onUnitChange,
  onWeightKgChange,
  className,
}: OnboardingWeightSectionProps) {
  const base = onboardingWeightSectionVariants();
  const display = displayWeight(weightKg, unit);
  const range =
    unit === "kg" ? ONBOARDING_WEIGHT_KG_RANGE : ONBOARDING_WEIGHT_LBS_RANGE;
  const unitLabel =
    unitOptions.find((option) => option.id === unit)?.label ?? unit;

  return (
    <div className={base.root({ className })} data-onboarding-nested-scroll>
      <div aria-label={label} className={base.unitTrack()} role="group">
        {unitOptions.map((option) => {
          const selected = option.id === unit;
          const styles = onboardingWeightSectionVariants({ selected });
          return (
            <Button size="lg"
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

      <WeightSlider
        aria-label={label}
        className={base.slider()}
        label={null}
        max={range.max}
        min={range.min}
        value={display}
        onChange={(next) => {
          onWeightKgChange(unit === "kg" ? next : lbsToKg(next));
        }}
      />
    </div>
  );
}
