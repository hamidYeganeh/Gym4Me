import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Button, Typography } from "@heroui/react";
import { ApiError } from "@repo/api";
import type {
  ForgotPasswordConfirmInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@repo/api";
import {
  AuthLayout,
  type AuthLayoutLabels,
} from "@repo/ui/layout/AuthLayout";
import { useTranslations } from "next-intl";
import { AuthForgotPasswordOtpForm } from "@/modules/auth/components/AuthForgotPasswordOtpForm";
import { AuthForgotPasswordPhoneForm } from "@/modules/auth/components/AuthForgotPasswordPhoneForm";
import { AuthForgotPasswordResetForm } from "@/modules/auth/components/AuthForgotPasswordResetForm";
import { adminAuth } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { forgotPasswordScreenVariants } from "./ForgotPasswordScreen.styles";
import type {
  ForgotPasswordScreenProps,
  ForgotPasswordStep,
} from "./ForgotPasswordScreen.types";

export function ForgotPasswordScreen({ className }: ForgotPasswordScreenProps) {
  const t = useTranslations("Admin.ForgotPassword");
  const styles = forgotPasswordScreenVariants();
  const navigate = useNavigate();

  const [step, setStep] = useState<ForgotPasswordStep>("phone");
  const [phone, setPhone] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
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

  const requestCode = async (payload: ForgotPasswordInput) => {
    setError(null);
    setIsPending(true);
    try {
      const result = await adminAuth.forgotPassword(payload);
      setPhone(payload.phone);
      setRemainingSeconds(result.expiresInSeconds);
      setDebugCode(result.debugCode ?? null);
      setStep("otp");
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError(t("errorRateLimited"));
      } else if (err instanceof ApiError) {
        setError(err.message || t("errorRequest"));
      } else {
        setError(t("errorRequest"));
      }
    } finally {
      setIsPending(false);
    }
  };

  const confirmCode = async (payload: ForgotPasswordConfirmInput) => {
    setError(null);
    setIsPending(true);
    try {
      const result = await adminAuth.forgotPasswordConfirm(payload);
      setResetToken(result.resetToken);
      setStep("reset");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || t("errorOtpInvalid"));
      } else {
        setError(t("errorOtpInvalid"));
      }
    } finally {
      setIsPending(false);
    }
  };

  const submitPassword = async (payload: ResetPasswordInput) => {
    setError(null);
    setIsPending(true);
    try {
      await adminAuth.resetPassword(payload);
      setStep("done");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || t("errorReset"));
      } else {
        setError(t("errorReset"));
      }
    } finally {
      setIsPending(false);
    }
  };

  const resendCode = async () => {
    if (remainingSeconds > 0 || isPending) return;
    setError(null);
    setIsPending(true);
    try {
      const result = await adminAuth.forgotPassword({ phone });
      setRemainingSeconds(result.expiresInSeconds);
      setDebugCode(result.debugCode ?? null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError(t("errorRateLimited"));
      } else if (err instanceof ApiError) {
        setError(err.message || t("errorRequest"));
      } else {
        setError(t("errorRequest"));
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AuthLayout
      className={className}
      labels={labels}
      footer={
        <RouterLink className={styles.back()} to={routes.signIn}>
          {t("backToSignIn")}
        </RouterLink>
      }
    >
      {step === "phone" ? (
        <AuthForgotPasswordPhoneForm
          error={error}
          isPending={isPending}
          onSubmit={requestCode}
        />
      ) : null}

      {step === "otp" ? (
        <AuthForgotPasswordOtpForm
          debugCode={debugCode}
          error={error}
          isPending={isPending}
          phone={phone}
          remainingSeconds={remainingSeconds}
          onResend={() => void resendCode()}
          onSubmit={confirmCode}
        />
      ) : null}

      {step === "reset" ? (
        <AuthForgotPasswordResetForm
          error={error}
          isPending={isPending}
          resetToken={resetToken}
          onSubmit={submitPassword}
        />
      ) : null}

      {step === "done" ? (
        <div className={styles.form()}>
          <Typography className={styles.success()}>{t("success")}</Typography>
          <Button
            className={styles.submit()}
            fullWidth
            size="lg"
            variant="primary"
            onPress={() => navigate(routes.signIn, { replace: true })}
          >
            {t("backToSignIn")}
          </Button>
        </div>
      ) : null}
    </AuthLayout>
  );
}
