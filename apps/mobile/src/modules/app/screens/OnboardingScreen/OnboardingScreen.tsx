"use client";

import { useOnboarding } from "@/modules/app/lib/use-onboarding";
import { OnboardingCarouselSection } from "@/modules/app/sections/OnboardingCarouselSection";
import { OnboardingFooterSection } from "@/modules/app/sections/OnboardingFooterSection";
import { OnboardingHeader } from "@/modules/app/sections/OnboardingHeader";
import { OnboardingPermissionSheet } from "@/modules/app/sections/OnboardingPermissionSheet";
import { onboardingScreenVariants } from "./OnboardingScreen.styles";
import type { OnboardingScreenProps } from "./OnboardingScreen.types";

export function OnboardingScreen({ className }: OnboardingScreenProps) {
  const styles = onboardingScreenVariants();
  const onboarding = useOnboarding();

  return (
    <main className={styles.root({ className })}>
      <div className={styles.content()}>
        <OnboardingHeader
          backLabel={onboarding.t("back")}
          className={styles.header()}
          progress={onboarding.progress}
          progressLabel={onboarding.t("progressLabel")}
          showProgress={onboarding.showHeaderProgress}
          skipLabel={onboarding.t("skip")}
          onBack={onboarding.goPrev}
          onSkip={onboarding.requestFinish}
        />

        <OnboardingCarouselSection {...onboarding} />

        {onboarding.activePermissionKind ? (
          <OnboardingPermissionSheet
            isOpen
            isRequesting={onboarding.isRequestingPermission}
            kind={onboarding.activePermissionKind}
            labels={{
              title: onboarding.t(
                `permissions.${onboarding.activePermissionKind}.title`,
              ),
              subtitle: onboarding.t(
                `permissions.${onboarding.activePermissionKind}.subtitle`,
              ),
              sampleTitle: onboarding.t(
                `permissions.${onboarding.activePermissionKind}.sampleTitle`,
              ),
              sampleBody: onboarding.t(
                `permissions.${onboarding.activePermissionKind}.sampleBody`,
              ),
              sampleAction: onboarding.t(
                `permissions.${onboarding.activePermissionKind}.sampleAction`,
              ),
              sampleTime: onboarding.t(
                `permissions.${onboarding.activePermissionKind}.sampleTime`,
              ),
              info: onboarding.t("permissions.info"),
              continue: onboarding.t("permissions.continue"),
              skip: onboarding.t("permissions.skip"),
            }}
            onContinue={onboarding.handlePermissionContinue}
            onOpenChange={(open) => {
              if (!open && !onboarding.isRequestingPermission) {
                onboarding.handlePermissionSkip();
              }
            }}
            onSkip={onboarding.handlePermissionSkip}
          />
        ) : null}

        <OnboardingFooterSection {...onboarding} />
      </div>
    </main>
  );
}
