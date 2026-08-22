"use client";

import { slideIsHeroBleed } from "@/modules/app/lib/onboarding-helpers";
import { useOnboarding } from "@/modules/app/lib/use-onboarding";
import { OnboardingCarouselSection } from "@/modules/app/sections/OnboardingCarouselSection";
import { OnboardingFooterSection } from "@/modules/app/sections/OnboardingFooterSection";
import { OnboardingHeader } from "@/modules/app/sections/OnboardingHeader";
import { OnboardingSavingSection } from "@/modules/app/sections/OnboardingSavingSection";
import { onboardingScreenVariants } from "./OnboardingScreen.styles";
import type { OnboardingScreenProps } from "./OnboardingScreen.types";

export function OnboardingScreen({ className }: OnboardingScreenProps) {
  const styles = onboardingScreenVariants();
  const onboarding = useOnboarding();
  const showFooterScrim = slideIsHeroBleed(onboarding.step);

  return (
    <main className={styles.root({ className })}>
      {onboarding.isSavingView ? (
        <OnboardingSavingSection
          ariaLabel={onboarding.t("saving.aria")}
          errorLabel={onboarding.t("saving.error")}
          retryLabel={onboarding.t("saving.retry")}
          steps={onboarding.saveSteps}
          onRetry={onboarding.retrySave}
        />
      ) : (
        <>
          <OnboardingCarouselSection {...onboarding} />

          <div className={styles.header()}>
            <div className={styles.headerActions()}>
              <OnboardingHeader
                backLabel={onboarding.t("back")}
                progress={onboarding.progress}
                progressLabel={onboarding.t("progressLabel")}
                skipLabel={onboarding.t("skip")}
                stepLabel={onboarding.t("stepLabel", {
                  current: onboarding.slide + 1,
                  total: onboarding.totalSteps,
                })}
                onBack={onboarding.goPrev}
                onSkip={onboarding.skipOnboarding}
              />
            </div>
          </div>

          <div className={styles.footer()}>
            {showFooterScrim ? (
              <div aria-hidden className={styles.footerScrim()} />
            ) : null}
            <div className={styles.footerActions()}>
              <OnboardingFooterSection {...onboarding} />
            </div>
          </div>
        </>
      )}
    </main>
  );
}
