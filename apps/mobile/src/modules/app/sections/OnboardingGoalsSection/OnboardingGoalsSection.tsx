"use client";

import type { ComponentType } from "react";
import { Button } from "@heroui/react/button";
import { Check } from "@repo/icons/Check";
import { HealthCross1 } from "@repo/icons/HealthCross1";
import { HeartEcg } from "@repo/icons/HeartEcg";
import { Mobile } from "@repo/icons/Mobile";
import { PersonRunning } from "@repo/icons/PersonRunning";
import { RobotFace1 } from "@repo/icons/RobotFace1";
import type { OnboardingGoalId } from "@/modules/app/lib/onboarding-data";
import { onboardingGoalsSectionVariants } from "./OnboardingGoalsSection.styles";
import type { OnboardingGoalsSectionProps } from "./OnboardingGoalsSection.types";

const GOAL_ICONS: Record<
  OnboardingGoalId,
  ComponentType<{ className?: string; size?: number; "aria-hidden"?: boolean }>
> = {
  overallHealth: HealthCross1,
  trackMetrics: HeartEcg,
  aiAssistant: RobotFace1,
  sportsActivity: PersonRunning,
  justTrying: Mobile,
};

export function OnboardingGoalsSection({
  label,
  options,
  selected,
  onToggle,
  className,
}: OnboardingGoalsSectionProps) {
  const base = onboardingGoalsSectionVariants();

  return (
    <div className={base.root({ className })}>
      <div aria-label={label} className={base.list()} role="group">
        {options.map((option) => {
          const isSelected = selected.includes(option.id);
          const styles = onboardingGoalsSectionVariants({ selected: isSelected });
          const Icon = GOAL_ICONS[option.id];

          return (
            <Button
              key={option.id}
              aria-pressed={isSelected}
              className={styles.option()}
              variant="ghost"
              onPress={() => onToggle(option.id)}
            >
              <Icon aria-hidden className={styles.optionIcon()} size={24} />
              <span className={styles.optionLabel()}>{option.label}</span>
              <span aria-hidden className={styles.check()}>
                {isSelected ? (
                  <Check className={styles.checkIcon()} size={14} />
                ) : null}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
