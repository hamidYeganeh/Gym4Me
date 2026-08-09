import { useEffect, useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button, InputOTP } from "@heroui/react";
import { ApiError } from "@repo/api";
import { ArrowLeft, ArrowRight } from "@repo/icons";
import {
  AuthLayout,
  type AuthLayoutLabels,
} from "@repo/ui/layout/AuthLayout";
import { useTranslations } from "next-intl";
import { useAuth } from "@/shared/providers/AuthProvider";
import { otpScreenVariants } from "./OtpScreen.styles";
import type {
  OtpRouteState,
  OtpScreenProps,
} from "./OtpScreen.types";

const HERO_SRC = "/assets/images/auth-hero.jpg";
const OTP_LENGTH = 6;
const OTP_PATTERN = "^[0-9۰-۹٠-٩]+$";

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/\D/g, "")
    .slice(0, OTP_LENGTH);
}

function maskPhone(phone: string) {
  if (phone.length < 8) return phone;
  return `${phone.slice(0, 4)}***${phone.slice(-4)}`;
}

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes.toLocaleString("fa-IR")}:${remainder
    .toLocaleString("fa-IR", { minimumIntegerDigits: 2 })
    .replace(/\u200e/g, "")}`;
}

export function OtpScreen({ className }: OtpScreenProps) {
  const t = useTranslations("Admin.Otp");
  const styles = otpScreenVariants();
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithOtp, requestOtp } = useAuth();
  const routeState = location.state as OtpRouteState | null;
  const phone = routeState?.phone ?? "";
  const [code, setCode] = useState("");
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (code.length !== OTP_LENGTH) {
      setError(t("errorRequired"));
      return;
    }

    setIsPending(true);
    try {
      await loginWithOtp(phone, code);
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
      setCode("");
      setNotice(t("resent"));
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
      heroSrc={HERO_SRC}
      footer={<p>{t("securityNote")}</p>}
    >
      <form className={styles.form()} onSubmit={handleSubmit}>
        <div className={styles.codeArea()}>
          <p className={styles.phone()}>
            {t("sentTo")}{" "}
            <b className={styles.phoneValue()}>{maskPhone(phone)}</b>
          </p>

          <InputOTP
            autoFocus
            className={styles.otp()}
            inputMode="numeric"
            maxLength={OTP_LENGTH}
            pattern={OTP_PATTERN}
            value={code}
            onChange={(value) => setCode(normalizeDigits(value))}
          >
            <InputOTP.Group className={styles.otpGroup()}>
              {Array.from({ length: OTP_LENGTH }, (_, index) => (
                <InputOTP.Slot
                  className={styles.otpSlot()}
                  index={index}
                  key={index}
                />
              ))}
            </InputOTP.Group>
          </InputOTP>
        </div>

        {debugCode ? (
          <aside className={styles.debugPanel()}>
            <div className={styles.debugCopy()}>
              <span className={styles.debugLabel()}>{t("debugLabel")}</span>
              <code className={styles.debugCode()}>{debugCode}</code>
            </div>
            <Button
              className={styles.debugAction()}
              size="sm"
              type="button"
              variant="ghost"
              onPress={() => setCode(debugCode)}
            >
              {t("useDebugCode")}
            </Button>
          </aside>
        ) : null}

        {error ? (
          <p className={styles.error()} role="alert">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className={styles.notice()} role="status">
            {notice}
          </p>
        ) : null}

        <Button
          className={styles.submit()}
          fullWidth
          isDisabled={code.length !== OTP_LENGTH}
          isPending={isPending}
          size="lg"
          type="submit"
          variant="primary"
        >
          {t("submit")}
          <ArrowRight className={styles.submitIcon()} size={24} />
        </Button>

        <div className={styles.resendRow()}>
          {remainingSeconds > 0 ? (
            <>
              <span>{t("resendIn")}</span>
              <span className={styles.timer()}>
                {formatTimer(remainingSeconds)}
              </span>
            </>
          ) : (
            <Button
              className={styles.resend()}
              isPending={isResending}
              size="sm"
              type="button"
              variant="ghost"
              onPress={handleResend}
            >
              {t("resend")}
            </Button>
          )}
        </div>

        <Button
          className={styles.back()}
          type="button"
          variant="ghost"
          onPress={() => navigate("/sign-in", { replace: true })}
        >
          <ArrowLeft size={18} />
          {t("back")}
        </Button>
      </form>
    </AuthLayout>
  );
}
