import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";
import { ApiError } from "@repo/api";
import type { ConfirmOtpInput } from "@repo/api";
import { ArrowLeft } from "@repo/icons";
import {
  AuthLayout,
  type AuthLayoutLabels,
} from "@repo/ui/layout/AuthLayout";
import { useTranslations } from "next-intl";
import { AuthLoginOtpForm } from "@/modules/auth/components/AuthLoginOtpForm";
import { useAuth } from "@/shared/providers/AuthProvider";
import { otpScreenVariants } from "./OtpScreen.styles";
import type { OtpRouteState, OtpScreenProps } from "./OtpScreen.types";

export function OtpScreen({ className }: OtpScreenProps) {
  const t = useTranslations("Admin.Otp");
  const styles = otpScreenVariants();
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithOtp, requestOtp } = useAuth();
  const routeState = location.state as OtpRouteState | null;
  const phone = routeState?.phone ?? "";
  const [remainingSeconds, setRemainingSeconds] = useState(
    routeState?.expiresInSeconds ?? 0,
  );
  const [debugCode, setDebugCode] = useState<string | null>(
    routeState?.debugCode ?? null,
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otpFormKey, setOtpFormKey] = useState(0);

  useEffect(() => {
    if (!phone) return;

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [phone]);

  if (!phone) {
    return <Navigate replace to="/sign-in" />;
  }

  const labels: AuthLayoutLabels = {
    title: t("title"),
    subtitle: t("subtitle"),
    brandAriaLabel: t("brandAriaLabel"),
    heroAlt: t("heroAlt"),
  };

  const getErrorMessage = (err: unknown) => {
    if (err instanceof ApiError && err.status === 429) {
      return t("errorRateLimited");
    }
    if (err instanceof ApiError && err.message) {
      return err.message;
    }
    return t("errorInvalid");
  };

  const handleSubmit = async (payload: ConfirmOtpInput) => {
    setError(null);
    setNotice(null);
    setIsPending(true);
    try {
      await loginWithOtp(payload.phone, payload.code);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsPending(false);
    }
  };

  const handleResend = async () => {
    if (remainingSeconds > 0 || isResending) return;

    setError(null);
    setNotice(null);
    setIsResending(true);
    try {
      const result = await requestOtp(phone);
      setRemainingSeconds(result.expiresInSeconds);
      setDebugCode(result.debugCode ?? null);
      setNotice(t("resent"));
      setOtpFormKey((current) => current + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      className={className}
      labels={labels}
      footer={<p>{t("securityNote")}</p>}
    >
      <div className={styles.form()}>
        <AuthLoginOtpForm
          key={otpFormKey}
          debugCode={debugCode}
          error={error}
          isPending={isPending}
          isResending={isResending}
          notice={notice}
          phone={phone}
          remainingSeconds={remainingSeconds}
          onResend={() => void handleResend()}
          onSubmit={handleSubmit}
        />
        <Button
          className={styles.back()}
          type="button"
          variant="ghost"
          onPress={() => navigate("/sign-in", { replace: true })}
        >
          <ArrowLeft size={18} />
          {t("back")}
        </Button>
      </div>
    </AuthLayout>
  );
}
