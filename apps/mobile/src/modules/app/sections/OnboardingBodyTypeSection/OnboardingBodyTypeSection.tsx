"use client";

import { Typography } from "@heroui/react/typography";
import {
  BodyTypeCard,
  type BodyTypeGender,
} from "@repo/ui/cards/BodyTypeCard";
import { onboardingBodyTypeSectionVariants } from "./OnboardingBodyTypeSection.styles";
import type { OnboardingBodyTypeSectionProps } from "./OnboardingBodyTypeSection.types";

function toArtGender(
  gender: OnboardingBodyTypeSectionProps["gender"],
): BodyTypeGender {
  return gender === "male" ? "male" : "female";
}

export function OnboardingBodyTypeSection({
  options,
  value,
  gender,
  onChange,
  className,
}: OnboardingBodyTypeSectionProps) {
  const styles = onboardingBodyTypeSectionVariants();
  const artGender = toArtGender(gender);
  const selected = options.find((option) => option.id === value) ?? options[0];

  return (
    <div className={styles.root({ className })}>
      <div className={styles.grid()} role="radiogroup">
        {options.map((option) => (
          <BodyTypeCard
            actionLabel={option.label}
            bodyType={option.id}
            className={styles.card()}
            gender={artGender}
            isSelected={option.id === value}
            key={option.id}
            onChange={(selectedNext) => {
              if (!selectedNext) return;
              onChange(option.id);
            }}
          />
        ))}
      </div>

      {selected && value != null ? (
        <Typography className={styles.statement()}>{selected.statement}</Typography>
      ) : null}
    </div>
  );
}
