"use client";

import type { ComponentType } from "react";
import { Button } from "@heroui/react/button";
import { ScrollShadow } from "@heroui/react/scroll-shadow";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { Check } from "@repo/icons/Check";
import { HealthCross1 } from "@repo/icons/HealthCross1";
import { HeartEcg } from "@repo/icons/HeartEcg";
import { Mobile } from "@repo/icons/Mobile";
import { PersonRunning } from "@repo/icons/PersonRunning";
import { RobotFace1 } from "@repo/icons/RobotFace1";
import { EmptyState } from "@repo/ui/kit/EmptyState";
import { onboardingGoalsSectionVariants } from "./OnboardingGoalsSection.styles";
import type { OnboardingGoalsSectionProps } from "./OnboardingGoalsSection.types";

type IconComponent = ComponentType<{
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}>;

const GOAL_ICONS: Record<string, IconComponent> = {
  overallhealth: HealthCross1,
  health: HealthCross1,
  trackmetrics: HeartEcg,
  metrics: HeartEcg,
  aiassistant: RobotFace1,
  ai: RobotFace1,
  sportsactivity: PersonRunning,
  sports: PersonRunning,
  justtrying: Mobile,
  trying: Mobile,
};

function resolveGoalIcon(id: string): IconComponent {
  const key = id.toLowerCase().replace(/[^a-z0-9]/g, "");
  return GOAL_ICONS[key] ?? HealthCross1;
}

export function OnboardingGoalsSection({
  label,
  options,
  selected,
  onToggle,
  isLoading = false,
  isError = false,
  emptyLabel,
  errorLabel,
  className,
}: OnboardingGoalsSectionProps) {
  const base = onboardingGoalsSectionVariants();

  if (isLoading) {
    return (
      <div className={base.root({ className })}>
        <div className={base.status()}>
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={base.root({ className })}>
        <Typography className={base.statusText()}>{errorLabel}</Typography>
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className={base.root({ className })}>
        <EmptyState title={emptyLabel} />
      </div>
    );
  }

  return (
    <div className={base.root({ className })}>
      <ScrollShadow
        hideScrollBar
        className={base.scroller()}
        orientation="vertical"
        size={56}
      >
        <div aria-label={label} className={base.list()} role="group">
          {options.map((option) => {
            const isSelected = selected.includes(option.id);
            const styles = onboardingGoalsSectionVariants({ selected: isSelected });
            const Icon = resolveGoalIcon(option.id);

            return (
              <Button size="lg"
                key={option.id}
                aria-pressed={isSelected}
                className={styles.option()}
                fullWidth
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
      </ScrollShadow>
    </div>
  );
}
