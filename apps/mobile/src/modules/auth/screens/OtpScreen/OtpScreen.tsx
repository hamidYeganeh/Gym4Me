"use client";

import { Button } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AuthLayout } from "@repo/ui/layout/AuthLayout";
import { AuthLoginOtpForm } from "@/modules/auth/components/AuthLoginOtpForm";
import { AuthLoginOtpRequestForm } from "@/modules/auth/components/AuthLoginOtpRequestForm";
import { useOtpScreen } from "@/modules/auth/lib/use-otp-screen";
import { OtpScreenAltAuthSection } from "@/modules/auth/sections/OtpScreenAltAuthSection";
import { OtpScreenVerifyFooterSection } from "@/modules/auth/sections/OtpScreenVerifyFooterSection";
import { otpScreenVariants } from "./OtpScreen.styles";
import type { OtpScreenProps } from "./OtpScreen.types";

const HERO_SRC = "/auth-hero.jpg";

export function OtpScreen({ className }: OtpScreenProps) {
  const styles = otpScreenVariants();
  const otp = useOtpScreen();

  return (
    <AuthLayout
      className={className}
      belowForm={
        otp.step === "request" ? (
          <OtpScreenAltAuthSection
            buttonLabel={otp.tAuth("usePasswordInstead")}
            dividerLabel={otp.tAuth("orSignInWith")}
            onPress={otp.navigateToLogin}
          />
        ) : null
      }
      footer={
        otp.step === "verify" ? (
          <OtpScreenVerifyFooterSection
            label={otp.tAuth("usePasswordInstead")}
            onPress={otp.navigateToLogin}
          />
        ) : null
      }
      heroSrc={HERO_SRC}
      labels={otp.labels}
      tone="plain"
      topStart={
        <Button
          aria-label={otp.t("back")}
          className={styles.backButton()}
          isIconOnly
          onPress={otp.goBack}
          size="lg"
          type="button"
          variant="ghost"
        >
          <ChevronLeft size={22} />
        </Button>
      }
    >
      {otp.step === "request" ? (
        <AuthLoginOtpRequestForm
          defaultPhone={otp.phone}
          error={otp.error}
          isPending={otp.isPending}
          onDismissError={otp.clearError}
          onSubmit={otp.handleRequest}
        />
      ) : (
        <AuthLoginOtpForm
          debugCode={otp.debugCode}
          error={otp.error}
          isPending={otp.isPending}
          isResending={otp.isResending}
          key={otp.otpFormKey}
          notice={otp.notice}
          onDismissError={otp.clearError}
          onResend={() => void otp.handleResend()}
          onSubmit={otp.handleVerify}
          phone={otp.phone}
          remainingSeconds={otp.remainingSeconds}
        />
      )}
    </AuthLayout>
  );
}
