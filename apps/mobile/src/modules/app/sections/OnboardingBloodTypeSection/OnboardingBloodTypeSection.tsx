"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { Minus } from "@repo/icons/Minus";
import { Plus } from "@repo/icons/Plus";
import { onboardingBloodTypeSectionVariants } from "./OnboardingBloodTypeSection.styles";
import type { OnboardingBloodTypeSectionProps } from "./OnboardingBloodTypeSection.types";

export function OnboardingBloodTypeSection({
  groups,
  group,
  rh,
  groupAria,
  rhAria,
  onGroupChange,
  onRhChange,
  className,
}: OnboardingBloodTypeSectionProps) {
  const base = onboardingBloodTypeSectionVariants();

  return (
    <div className={base.root({ className })}>
      <div aria-label={groupAria} className={base.groupTrack()} role="group">
        {groups.map((item) => {
          const selected = item === group;
          const styles = onboardingBloodTypeSectionVariants({ selected });
          return (
            <Button
              key={item}
              aria-pressed={selected}
              className={styles.groupItem()}
              variant="ghost"
              onPress={() => onGroupChange(item)}
            >
              {item}
            </Button>
          );
        })}
      </div>

      <div aria-live="polite" className={base.preview()}>
        <Typography className={base.letter()}>{group}</Typography>
        <span aria-hidden className={base.rhBadge()}>
          {rh === "positive" ? "+" : "−"}
        </span>
      </div>

      <div aria-label={rhAria} className={base.rhRow()} role="group">
        {(["negative", "positive"] as const).map((factor) => {
          const selected = factor === rh;
          const styles = onboardingBloodTypeSectionVariants({ selected });
          const Icon = factor === "positive" ? Plus : Minus;
          return (
            <Button
              key={factor}
              aria-pressed={selected}
              className={styles.rhItem()}
              variant="ghost"
              onPress={() => onRhChange(factor)}
            >
              <Icon aria-hidden className={styles.rhIcon()} size={24} />
            </Button>
          );
        })}
      </div>
    </div>
  );
}
