"use client";

import { Button } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { MediaImage } from "@repo/ui/common/MediaImage";
import { AuthLayout } from "@repo/ui/layout/AuthLayout";
import { AuthLoginOtpForm } from "@/modules/auth/components/AuthLoginOtpForm";
import { AuthLoginOtpRequestForm } from "@/modules/auth/components/AuthLoginOtpRequestForm";
import { useOtpScreen } from "@/modules/auth/lib/use-otp-screen";
import { OtpScreenAltAuthSection } from "@/modules/auth/sections/OtpScreenAltAuthSection";
import { OtpScreenVerifyFooterSection } from "@/modules/auth/sections/OtpScreenVerifyFooterSection";
import { otpScreenVariants } from "./OtpScreen.styles";
import type { OtpScreenProps } from "./OtpScreen.types";

const FIGURE_SRC = "/auth/otp-secure.png";

export function OtpScreen({ className }: OtpScreenProps) {
  const styles = otpScreenVariants();
  const otp = useOtpScreen();
  const isRequest = otp.step === "request";

  return (
    <AuthLayout
      className={className}
      belowForm={
        isRequest ? (
          <OtpScreenAltAuthSection
            buttonLabel={otp.tAuth("usePasswordInstead")}
            dividerLabel={otp.tAuth("orSignInWith")}
            onPress={otp.navigateToLogin}
          />
        ) : null
      }
      figure={
        isRequest ? (
          <MediaImage
            alt=""
            aria-hidden
            className={styles.figureImage()}
            image={FIGURE_SRC}
            priority
            sizes="208px"
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
      framed={false}
      labels={otp.labels}
      showBrand={false}
      tone="plain"
      topStart={
        <Button
          aria-label={otp.t("back")}
          className={styles.backButton()}
          isIconOnly
          onPress={otp.goBack}
          size="lg"
          type="button"
          variant="tertiary"
        >
          <ChevronLeft size={22} />
        </Button>
      }
    >
      {isRequest ? (
        <AuthLoginOtpRequestForm
          defaultPhone={otp.phone}
          isPending={otp.isPending}
          onSubmit={otp.handleRequest}
        />
      ) : (
        <AuthLoginOtpForm
          debugCode={otp.debugCode}
          isPending={otp.isPending}
          isResending={otp.isResending}
          key={otp.otpFormKey}
          onResend={() => void otp.handleResend()}
          onSubmit={otp.handleVerify}
          phone={otp.phone}
          remainingSeconds={otp.remainingSeconds}
        />
      )}
    </AuthLayout>
  );
}
