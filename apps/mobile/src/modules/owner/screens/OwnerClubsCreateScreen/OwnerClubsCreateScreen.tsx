"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ArrowRight } from "@repo/icons/ArrowRight";
import { FormStepper } from "@repo/ui/kit/FormStepper";
import { StickyBottomActions } from "@repo/ui/kit/StickyBottomActions";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import {
  LAST_CLUB_CREATE_STEP,
  useOwnerClubsCreate,
} from "@/modules/owner/lib/use-owner-clubs-create";
import { OwnerClubsCreateKycGateSection } from "@/modules/owner/sections/OwnerClubsCreateKycGateSection";
import { OwnerClubsCreateWizardSection } from "@/modules/owner/sections/OwnerClubsCreateWizardSection";
import { ownerClubsCreateScreenVariants } from "./OwnerClubsCreateScreen.styles";
import type { OwnerClubsCreateScreenProps } from "./OwnerClubsCreateScreen.types";

export function OwnerClubsCreateScreen({
  className,
}: OwnerClubsCreateScreenProps) {
  const styles = ownerClubsCreateScreenVariants();
  const wizard = useOwnerClubsCreate();

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <SecondaryPageHeader
          backAriaLabel={wizard.t("back")}
          onBack={() => wizard.router.back()}
          title={wizard.t("title")}
        />
      }
    >
      <div className={styles.content()}>
        <div className={styles.intro()}>
          <Typography type="h3" weight="semibold">
            {wizard.t("title")}
          </Typography>
          <Typography color="muted" type="body">
            {wizard.t("subtitle")}
          </Typography>
        </div>

        {wizard.kycGateVisible && wizard.kycStatus ? (
          <OwnerClubsCreateKycGateSection
            className={styles.stepCard()}
            ctaLabel={wizard.t("kycRequiredCta")}
            kycStatus={wizard.kycStatus}
            pendingHint={wizard.t("kycPendingHint")}
            requiredHint={wizard.t("kycRequiredHint")}
            title={wizard.t("kycRequiredTitle")}
            onCta={() => wizard.router.push("/owner/kyc")}
          />
        ) : (
          <>
            <FormStepper
              activeIndex={wizard.step}
              aria-label={wizard.t("stepperLabel")}
              className={styles.stepper()}
              steps={wizard.steps}
            />

            <OwnerClubsCreateWizardSection
              {...wizard}
              stepPanelClassName={styles.stepPanel()}
            />

            {wizard.error ? (
              <Typography
                className={styles.error()}
                role="alert"
                type="body-sm"
              >
                {wizard.error}
              </Typography>
            ) : null}
            {wizard.notice ? (
              <Typography
                className={styles.notice()}
                role="status"
                type="body-sm"
              >
                {wizard.notice}
              </Typography>
            ) : null}
          </>
        )}
      </div>

      {!wizard.kycGateVisible ? (
        <StickyBottomActions contentClassName={styles.navRow()}>
          <Button
            className={styles.navBack()}
            size="lg"
            variant="outline"
            onPress={wizard.goBack}
          >
            {wizard.t("prevStep")}
          </Button>
          {wizard.step < LAST_CLUB_CREATE_STEP ? (
            <Button
              className={styles.navNext()}
              size="lg"
              variant="primary"
              onPress={wizard.goNext}
            >
              {wizard.t("nextStep")}
              <ArrowRight size={20} />
            </Button>
          ) : null}
        </StickyBottomActions>
      ) : null}
    </AppLayout>
  );
}
