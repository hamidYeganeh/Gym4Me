"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@heroui/react/button";
import { Link } from "@heroui/react/link";
import { ApiError } from "@repo/api";
import type {
  ForgotPasswordConfirmInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@repo/api";
import { ArrowRight } from "@repo/icons/ArrowRight";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { MediaImage } from "@repo/ui/common/MediaImage";
import { toast } from "@repo/ui/kit/Toast";
import {
  AuthLayout,
  type AuthLayoutLabels,
} from "@repo/ui/layout/AuthLayout";
import { useTranslations } from "next-intl";
import { AuthForgotPasswordOtpForm } from "@/modules/auth/components/AuthForgotPasswordOtpForm";
import { AuthForgotPasswordPhoneForm } from "@/modules/auth/components/AuthForgotPasswordPhoneForm";
import { AuthForgotPasswordResetForm } from "@/modules/auth/components/AuthForgotPasswordResetForm";
import { accountAuth } from "@/shared/lib/api-client";
import { withAuthNext } from "@/shared/lib/auth-redirect";
import { forgotPasswordScreenVariants } from "./ForgotPasswordScreen.styles";
import type {
  ForgotPasswordScreenProps,
  ForgotPasswordStep,
} from "./ForgotPasswordScreen.types";
import { useRouter } from "@/shared/lib/app-router";

const FIGURE_SRC = "/auth/password-secure.png";

export function ForgotPasswordScreen({ className }: ForgotPasswordScreenProps) {
  const t = useTranslations("Mobile.ForgotPassword");
  const tAuth = useTranslations("Mobile.Auth");
  const styles = forgotPasswordScreenVariants();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const [step, setStep] = useState<ForgotPasswordStep>("phone");
  const [phone, setPhone] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (step !== "otp") return;
    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [step]);

  const labels: AuthLayoutLabels = {
    title: t(`steps.${step}.title`),
    subtitle: t(`steps.${step}.subtitle`),
    brandAriaLabel: t("brandAriaLabel"),
    heroAlt: t("heroAlt"),
  };

  const getRequestError = (err: unknown) => {
    if (err instanceof ApiError && err.status === 429) {
      return t("errorRateLimited");
    }
    if (err instanceof ApiError && err.message) return err.message;
    return t("errorRequest");
  };

  const notifyError = (message: string) => {
    toast.error(tAuth("toastErrorTitle"), { description: message });
  };

  const requestCode = async (payload: ForgotPasswordInput) => {
    setIsPending(true);
    try {
      const result = await accountAuth.forgotPassword(payload);
      setPhone(payload.phone);
      setRemainingSeconds(result.expiresInSeconds);
      setDebugCode(result.debugCode ?? null);
      setStep("otp");
    } catch (err) {
      notifyError(getRequestError(err));
    } finally {
      setIsPending(false);
    }
  };

  const confirmCode = async (payload: ForgotPasswordConfirmInput) => {
    setIsPending(true);
    try {
      const result = await accountAuth.forgotPasswordConfirm(payload);
      setResetToken(result.resetToken);
      setStep("reset");
    } catch (err) {
      notifyError(
        err instanceof ApiError && err.message
          ? err.message
          : t("errorOtpInvalid"),
      );
    } finally {
      setIsPending(false);
    }
  };

  const submitPassword = async (payload: ResetPasswordInput) => {
    setIsPending(true);
    try {
      await accountAuth.resetPassword(payload);
      toast.success(tAuth("toastSuccessTitle"), {
        description: t("success"),
      });
      setStep("done");
    } catch (err) {
      notifyError(
        err instanceof ApiError && err.message
          ? err.message
          : t("errorReset"),
      );
    } finally {
      setIsPending(false);
    }
  };

  const resendCode = async () => {
    if (remainingSeconds > 0 || isPending) return;
    setIsPending(true);
    try {
      const result = await accountAuth.forgotPassword({ phone });
      setRemainingSeconds(result.expiresInSeconds);
      setDebugCode(result.debugCode ?? null);
      toast.success(tAuth("toastSuccessTitle"), {
        description: t("resent"),
      });
    } catch (err) {
      notifyError(getRequestError(err));
    } finally {
      setIsPending(false);
    }
  };

  const goBack = () => {
    if (step === "phone") {
      router.replace(withAuthNext("/auth/login", next));
      return;
    }
    if (step === "otp") {
      setStep("phone");
      return;
    }
    if (step === "reset") {
      setStep("otp");
      return;
    }
    router.replace(withAuthNext("/auth/login", next));
  };

  const goToLogin = () => {
    router.replace(withAuthNext("/auth/login", next));
  };

  const supportPhone = t("supportPhone");
  const footer =
    step === "phone" ? (
      <div className={styles.footerCopy()}>
        <span>{t("forgotPhoneHelp")}</span>
        <span>
          {t("contactSupportLead")}{" "}
          <Link className={styles.footerLink()} href={`tel:${supportPhone}`}>
            {supportPhone}
          </Link>
        </span>
      </div>
    ) : (
      <Link className={styles.footerLink()} onPress={goToLogin}>
        {t("backToSignIn")}
      </Link>
    );

  return (
    <AuthLayout
      className={className}
      figure={
        step === "phone" ? (
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
      figurePlacement="beforeHeader"
      footer={footer}
      framed={false}
      labels={labels}
      showBrand={false}
      tone="plain"
      topStart={
        step !== "done" ? (
          <Button
            aria-label={t("back")}
            className={styles.backButton()}
            isIconOnly
            onPress={goBack}
            size="lg"
            type="button"
            variant="tertiary"
          >
            <ChevronLeft size={22} />
          </Button>
        ) : null
      }
    >
      {step === "phone" ? (
        <AuthForgotPasswordPhoneForm
          isPending={isPending}
          onSubmit={requestCode}
        />
      ) : null}

      {step === "otp" ? (
        <AuthForgotPasswordOtpForm
          debugCode={debugCode}
          isPending={isPending}
          phone={phone}
          remainingSeconds={remainingSeconds}
          onResend={() => void resendCode()}
          onSubmit={confirmCode}
        />
      ) : null}

      {step === "reset" ? (
        <AuthForgotPasswordResetForm
          isPending={isPending}
          resetToken={resetToken}
          onSubmit={submitPassword}
        />
      ) : null}

      {step === "done" ? (
        <div className={styles.form()}>
          <Button
            className={styles.submit()}
            fullWidth
            size="lg"
            variant="primary"
            onPress={goToLogin}
          >
            {t("backToSignIn")}
            <ArrowRight className={styles.submitIcon()} size={20} />
          </Button>
        </div>
      ) : null}
    </AuthLayout>
  );
}
