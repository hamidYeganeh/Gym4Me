"use client";

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
  type OnboardingWeightUnit,
} from "@/modules/app/lib/onboarding-units";
import { onboardingWeightSectionVariants } from "./OnboardingWeightSection.styles";
import type { OnboardingWeightSectionProps } from "./OnboardingWeightSection.types";

export function OnboardingWeightSection({
  label,
  unit,
  weightKg,
  unitKgLabel,
  unitLbsLabel,
  onUnitChange,
  onWeightKgChange,
  className,
}: OnboardingWeightSectionProps) {
  const base = onboardingWeightSectionVariants();
  const display = displayWeight(weightKg, unit);
  const range =
    unit === "kg" ? ONBOARDING_WEIGHT_KG_RANGE : ONBOARDING_WEIGHT_LBS_RANGE;
  const unitLabel = unit === "kg" ? unitKgLabel : unitLbsLabel;

  return (
    <div className={base.root({ className })} data-onboarding-nested-scroll>
      <div aria-label={label} className={base.unitTrack()} role="group">
        {(["lbs", "kg"] as const).map((option) => {
          const selected = option === unit;
          const styles = onboardingWeightSectionVariants({ selected });
          return (
            <Button
              key={option}
              aria-pressed={selected}
              className={styles.unitItem()}
              variant="ghost"
              onPress={() => onUnitChange(option)}
            >
              {option === "kg" ? unitKgLabel : unitLbsLabel}
            </Button>
          );
        })}
      </div>

      <div className={base.valueRow()}>
        <Typography className={base.value()}>{display}</Typography>
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
