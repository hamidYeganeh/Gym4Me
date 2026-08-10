"use client";

import Image from "next/image";
import { onboardingReviewSectionVariants } from "./OnboardingReviewSection.styles";
import type { OnboardingReviewSectionProps } from "./OnboardingReviewSection.types";

const REVIEW_SRC = "/onboarding-review.png";

export function OnboardingReviewSection({
  artAlt,
  className,
}: OnboardingReviewSectionProps) {
  const styles = onboardingReviewSectionVariants();

  return (
    <div className={styles.root({ className })}>
      <div className={styles.artWrap()}>
        <Image
          alt={artAlt}
          className={styles.art()}
          height={288}
          src={REVIEW_SRC}
          width={288}
        />
      </div>
    </div>
  );
}
