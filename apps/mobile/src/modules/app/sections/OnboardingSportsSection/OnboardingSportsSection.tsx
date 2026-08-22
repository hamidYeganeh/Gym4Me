"use client";

import type { ComponentType } from "react";
import { ScrollShadow } from "@heroui/react/scroll-shadow";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { BarbellHorizontal } from "@repo/icons/BarbellHorizontal";
import { Baseball } from "@repo/icons/Baseball";
import { ForkKnife } from "@repo/icons/ForkKnife";
import { PersonBiking } from "@repo/icons/PersonBiking";
import { PersonHiking } from "@repo/icons/PersonHiking";
import { PersonKarate } from "@repo/icons/PersonKarate";
import { PersonRowing } from "@repo/icons/PersonRowing";
import { PersonRunning } from "@repo/icons/PersonRunning";
import { PersonSkating } from "@repo/icons/PersonSkating";
import { PersonSoccer } from "@repo/icons/PersonSoccer";
import { PersonYoga } from "@repo/icons/PersonYoga";
import { ShapesTriangleSquareCirclce } from "@repo/icons/ShapesTriangleSquareCirclce";
import { Tennis } from "@repo/icons/Tennis";
import { Volleyball } from "@repo/icons/Volleyball";
import { SportSelectCard } from "@repo/ui/cards/SportSelectCard";
import { EmptyState } from "@repo/ui/kit/EmptyState";
import { onboardingSportsSectionVariants } from "./OnboardingSportsSection.styles";
import type { OnboardingSportsSectionProps } from "./OnboardingSportsSection.types";

type IconComponent = ComponentType<{
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}>;

const SPORT_ICONS: Record<string, IconComponent> = {
  jogging: PersonRunning,
  running: PersonRunning,
  personrunning: PersonRunning,
  cycling: PersonBiking,
  biking: PersonBiking,
  personbiking: PersonBiking,
  hiking: PersonHiking,
  personhiking: PersonHiking,
  yoga: PersonYoga,
  personyoga: PersonYoga,
  eating: ForkKnife,
  nutrition: ForkKnife,
  forkknife: ForkKnife,
  fitness: BarbellHorizontal,
  bodybuilding: BarbellHorizontal,
  crossfit: BarbellHorizontal,
  barbellhorizontal: BarbellHorizontal,
  rowing: PersonRowing,
  personrowing: PersonRowing,
  skating: PersonSkating,
  personskating: PersonSkating,
  tennis: Tennis,
  soccer: PersonSoccer,
  football: PersonSoccer,
  personsoccer: PersonSoccer,
  baseball: Baseball,
  volleyball: Volleyball,
  kickboxing: PersonKarate,
  combat: PersonKarate,
  personkarate: PersonKarate,
  other: ShapesTriangleSquareCirclce,
  shapestrianglesquarecirclce: ShapesTriangleSquareCirclce,
};

function resolveSportIcon(
  slug: string,
  icon: string | null | undefined,
): IconComponent {
  const candidates = [icon, slug]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.toLowerCase().replace(/[^a-z0-9]/g, ""));

  for (const key of candidates) {
    const match = SPORT_ICONS[key];
    if (match) return match;
  }
  return BarbellHorizontal;
}

export function OnboardingSportsSection({
  label,
  options,
  selected,
  onToggle,
  isLoading = false,
  isError = false,
  emptyLabel,
  errorLabel,
  className,
}: OnboardingSportsSectionProps) {
  const styles = onboardingSportsSectionVariants();

  if (isLoading) {
    return (
      <div className={styles.root({ className })}>
        <div className={styles.status()}>
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.root({ className })}>
        <Typography className={styles.statusText()}>{errorLabel}</Typography>
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className={styles.root({ className })}>
        <EmptyState title={emptyLabel} />
      </div>
    );
  }

  return (
    <div className={styles.root({ className })}>
      <ScrollShadow
        hideScrollBar
        className={styles.scroller()}
        orientation="vertical"
        size={56}
      >
        <div aria-label={label} className={styles.grid()} role="group">
          {options.map((option) => {
            const isSelected = selected.includes(option.id);
            const Icon = resolveSportIcon(option.slug, option.icon);

            return (
              <SportSelectCard
                actionLabel={option.label}
                icon={<Icon aria-hidden size={32} />}
                isSelected={isSelected}
                key={option.id}
                label={option.label}
                onChange={() => onToggle(option.id)}
              />
            );
          })}
        </div>
      </ScrollShadow>
    </div>
  );
}
