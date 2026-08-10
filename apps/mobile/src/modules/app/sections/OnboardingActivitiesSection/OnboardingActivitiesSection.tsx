"use client";

import type { ComponentType } from "react";
import { Button } from "@heroui/react";
import {
  BarbellHorizontal,
  Baseball,
  ForkKnife,
  PersonBiking,
  PersonHiking,
  PersonRowing,
  PersonRunning,
  PersonSkating,
  PersonSoccer,
  PersonYoga,
  ShapesTriangleSquareCirclce,
  Tennis,
} from "@repo/icons";
import type { OnboardingActivityId } from "@/modules/app/lib/onboarding-data";
import { onboardingActivitiesSectionVariants } from "./OnboardingActivitiesSection.styles";
import type { OnboardingActivitiesSectionProps } from "./OnboardingActivitiesSection.types";

const ACTIVITY_ICONS: Record<
  OnboardingActivityId,
  ComponentType<{ className?: string; size?: number; "aria-hidden"?: boolean }>
> = {
  jogging: PersonRunning,
  cycling: PersonBiking,
  hiking: PersonHiking,
  yoga: PersonYoga,
  eating: ForkKnife,
  fitness: BarbellHorizontal,
  rowing: PersonRowing,
  skating: PersonSkating,
  tennis: Tennis,
  soccer: PersonSoccer,
  baseball: Baseball,
  other: ShapesTriangleSquareCirclce,
};

export function OnboardingActivitiesSection({
  label,
  options,
  selected,
  onToggle,
  className,
}: OnboardingActivitiesSectionProps) {
  const base = onboardingActivitiesSectionVariants();

  return (
    <div className={base.root({ className })}>
      <div aria-label={label} className={base.grid()} role="group">
        {options.map((option) => {
          const isSelected = selected.includes(option.id);
          const styles = onboardingActivitiesSectionVariants({
            selected: isSelected,
          });
          const Icon = ACTIVITY_ICONS[option.id];

          return (
            <Button
              key={option.id}
              aria-pressed={isSelected}
              className={styles.card()}
              variant="ghost"
              onPress={() => onToggle(option.id)}
            >
              <span className={styles.iconWrap()}>
                <Icon aria-hidden className={styles.icon()} size={32} />
              </span>
              <span className={styles.label()}>{option.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
