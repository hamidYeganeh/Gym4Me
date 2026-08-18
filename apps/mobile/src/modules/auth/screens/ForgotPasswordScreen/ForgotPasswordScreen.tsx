"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@heroui/react/button";
import { Link } from "@heroui/react/link";
import { Typography } from "@heroui/react/typography";
import { ApiError } from "@repo/api";
import type {
  ForgotPasswordConfirmInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@repo/api";
import { ArrowRight } from "@repo/icons/ArrowRight";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
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

const SUPPORT_HREF = "mailto:support@gym4me.ir";

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
    title: step === "reset" ? undefined : t(`steps.${step}.title`),
    subtitle: t(`steps.${step}.subtitle`),
    brandAriaLabel: t("brandAriaLabel"),
    heroAlt: t("heroAlt"),
  };

  const showBrand = step === "reset" || step === "done";

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

  const footer =
    step === "phone" ? (
      <div className={styles.footerCopy()}>
        <span>{t("forgotPhoneHelp")}</span>
        <Link className={styles.footerLink()} href={SUPPORT_HREF}>
          {t("contactSupport")}
        </Link>
      </div>
    ) : (
      <Typography type="body-sm">
        <Link
          className={styles.footerLink()}
          onPress={() =>
            router.replace(withAuthNext("/auth/login", next))
          }
        >
          {t("backToSignIn")}
        </Link>
      </Typography>
    );

  return (
    <AuthLayout
      className={className}
      footer={footer}
      labels={labels}
      showBrand={showBrand}
      tone="dark"
      topStart={
        step !== "done" ? (
          <Button
            aria-label={t("back")}
            className={styles.backButton()}
            isIconOnly
            size="lg"
            type="button"
            variant="ghost"
            onPress={goBack}
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
          <Typography className={styles.success()} type="body-sm">
            {t("success")}
          </Typography>
          <Button
            className={styles.submit()}
            fullWidth
            size="lg"
            variant="primary"
            onPress={() =>
              router.replace(withAuthNext("/auth/login", next))
            }
          >
            {t("backToSignIn")}
            <ArrowRight className={styles.submitIcon()} size={20} />
          </Button>
        </div>
      ) : null}
    </AuthLayout>
  );
}
