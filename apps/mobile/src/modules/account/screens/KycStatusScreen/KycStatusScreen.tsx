"use client";

import { useKycStatus } from "@/modules/account/lib/use-kyc-status";
import { KycStatusDetailsSection } from "@/modules/account/sections/KycStatusDetailsSection";
import { KycStatusIntroSection } from "@/modules/account/sections/KycStatusIntroSection";
import { KycStatusOutcomeSection } from "@/modules/account/sections/KycStatusOutcomeSection";
import { KycStatusProcessingSection } from "@/modules/account/sections/KycStatusProcessingSection";
import { KycStatusScanSection } from "@/modules/account/sections/KycStatusScanSection";
import { kycStatusScreenVariants } from "./KycStatusScreen.styles";
import type { KycStatusScreenProps } from "./KycStatusScreen.types";

const KYC_FIGURE_SRC = "/auth/kyc-id.png";

export function KycStatusScreen({
  className,
  roleSegment = "athlete",
}: KycStatusScreenProps) {
  const styles = kycStatusScreenVariants();
  const kyc = useKycStatus(roleSegment);

  if (kyc.step === "scan") {
    return <KycStatusScanSection {...kyc} className={className} />;
  }

  if (kyc.step === "processing") {
    return (
      <KycStatusProcessingSection
        activeIndex={kyc.processingIndex}
        className={className}
        labels={kyc.processingLabels}
      />
    );
  }

  if (kyc.step === "success" || kyc.step === "pending") {
    const isSuccess = kyc.step === "success";
    return (
      <KycStatusOutcomeSection
        className={className}
        continueLabel={kyc.t("continue")}
        subtitle={
          isSuccess ? kyc.t("success.subtitle") : kyc.t("pending.subtitle")
        }
        title={isSuccess ? kyc.t("success.title") : kyc.t("pending.title")}
        onContinue={() => kyc.router.push(kyc.profilePath)}
      />
    );
  }

  return (
    <main className={styles.root({ className })}>
      <section className={styles.panel()}>
        {kyc.step === "intro" || kyc.step === "rejected" ? (
          <KycStatusIntroSection
            backLabel={kyc.t("back")}
            error={
              kyc.step === "rejected"
                ? (kyc.error ?? kyc.status?.identity.rejectionReason)
                : null
            }
            figureSrc={KYC_FIGURE_SRC}
            readyLabel={kyc.t("intro.ready")}
            skipLabel={kyc.t("intro.skip")}
            subtitle={kyc.t("intro.subtitle")}
            tips={kyc.tips}
            title={kyc.t("intro.title")}
            onBack={kyc.goBack}
            onReady={() => {
              kyc.setError(null);
              kyc.setStep("details");
            }}
            onSkip={() => kyc.router.push(kyc.profilePath)}
          />
        ) : null}

        {kyc.step === "details" ? <KycStatusDetailsSection {...kyc} /> : null}
      </section>
    </main>
  );
}
