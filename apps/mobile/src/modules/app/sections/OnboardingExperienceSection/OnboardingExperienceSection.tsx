"use client";

import Image from "next/image";
import { onboardingExperienceSectionVariants } from "./OnboardingExperienceSection.styles";
import type { OnboardingExperienceSectionProps } from "./OnboardingExperienceSection.types";

const FITNESS_SRC = "/onboarding-fitness.png";

export function OnboardingExperienceSection({
  imageAlt,
  className,
}: OnboardingExperienceSectionProps) {
  const styles = onboardingExperienceSectionVariants();

  return (
    <div className={styles.root({ className })}>
      <div className={styles.figure()}>
        <Image
          alt={imageAlt}
          className={styles.image()}
          height={480}
          src={FITNESS_SRC}
          width={384}
        />
      </div>
    </div>
  );
}
