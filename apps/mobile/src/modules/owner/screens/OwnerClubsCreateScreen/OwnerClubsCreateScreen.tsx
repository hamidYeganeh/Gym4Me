"use client";

import { Button, Typography } from "@heroui/react";
import { ArrowRight } from "@repo/icons/ArrowRight";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { FormStepper } from "@repo/ui/kit/FormStepper";
import { StickyBottomActions } from "@repo/ui/kit/StickyBottomActions";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
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
        <Header
          startContent={
            <Button
              aria-label={wizard.t("back")}
              isIconOnly
              onPress={() => wizard.router.back()}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
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
              <p className={styles.error()} role="alert">
                {wizard.error}
              </p>
            ) : null}
            {wizard.notice ? (
              <p className={styles.notice()} role="status">
                {wizard.notice}
              </p>
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
