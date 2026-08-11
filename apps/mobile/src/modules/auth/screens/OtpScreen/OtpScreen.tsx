"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Link } from "@heroui/react";
import { ApiError } from "@repo/api";
import type { ConfirmOtpInput, RequestOtpInput } from "@repo/api";
import { ChevronLeft, Lock1 } from "@repo/icons";
import {
  AuthLayout,
  type AuthLayoutLabels,
} from "@repo/ui/layout/AuthLayout";
import { useTranslations } from "next-intl";
import { AuthLoginOtpForm } from "@/modules/auth/components/AuthLoginOtpForm";
import { AuthLoginOtpRequestForm } from "@/modules/auth/components/AuthLoginOtpRequestForm";
import {
  clearOtpPending,
  readOtpPending,
  saveOtpPending,
  type OtpPendingState,
} from "@/modules/auth/lib/otp-pending";
import { withAuthNext } from "@/shared/lib/auth-redirect";
import { roleHomePath } from "@/shared/lib/role-routes";
import { useAuth } from "@/shared/providers/AuthProvider";
import { otpScreenVariants } from "./OtpScreen.styles";
import type { OtpScreenProps } from "./OtpScreen.types";

const HERO_SRC = "/auth-hero.jpg";

const subscribeOtpPending = () => () => {};

function getOtpPendingSnapshot() {
  return readOtpPending();
}

function getOtpPendingServerSnapshot(): OtpPendingState | null {
  return null;
}

function maskPhone(phone: string) {
  if (phone.length < 8) return phone;
  return `••${phone.slice(-4)}`;
}

type OtpSession = {
  step: "request" | "verify";
  phone: string;
  remainingSeconds: number;
  debugCode: string | null;
};

function sessionFromPending(pending: OtpPendingState | null): OtpSession {
  if (pending?.phone) {
    return {
      step: "verify",
      phone: pending.phone,
      remainingSeconds: pending.expiresInSeconds,
      debugCode: pending.debugCode ?? null,
    };
  }
  return {
    step: "request",
    phone: "",
    remainingSeconds: 0,
    debugCode: null,
  };
}

export function OtpScreen({ className }: OtpScreenProps) {
  const t = useTranslations("Mobile.Otp");
  const tAuth = useTranslations("Mobile.Auth");
  const styles = otpScreenVariants();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithOtp, requestOtp } = useAuth();

  const storedPending = useSyncExternalStore(
    subscribeOtpPending,
    getOtpPendingSnapshot,
    getOtpPendingServerSnapshot,
  );

  const [session, setSession] = useState<OtpSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otpFormKey, setOtpFormKey] = useState(0);

  // Prefer local session once the user interacts; otherwise mirror sessionStorage.
  const active = session ?? sessionFromPending(storedPending);
  const { step, phone, remainingSeconds, debugCode } = active;

  const next = searchParams.get("next");
  const loginHref = withAuthNext("/auth/login", next);

  useEffect(() => {
    if (step !== "verify" || !phone) return;
    const timer = window.setInterval(() => {
      setSession((current) => {
        const base = current ?? sessionFromPending(readOtpPending());
        if (base.step !== "verify" || base.remainingSeconds <= 0) return current ?? base;
        return {
          ...base,
          remainingSeconds: Math.max(0, base.remainingSeconds - 1),
        };
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phone, step]);

  const labels: AuthLayoutLabels =
    step === "verify"
      ? {
          subtitle: t("sentToMasked", { phone: maskPhone(phone) }),
          brandAriaLabel: t("brandAriaLabel"),
          heroAlt: t("heroAlt"),
        }
      : {
          subtitle: t("requestSubtitle"),
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
    return step === "verify" ? t("errorInvalid") : tAuth("errorOtpRequest");
  };

  const handleRequest = async (payload: RequestOtpInput) => {
    setError(null);
    setNotice(null);
    setIsPending(true);
    try {
      const result = await requestOtp(payload.phone);
      saveOtpPending({
        phone: payload.phone,
        expiresInSeconds: result.expiresInSeconds,
        debugCode: result.debugCode,
      });
      setSession({
        step: "verify",
        phone: payload.phone,
        remainingSeconds: result.expiresInSeconds,
        debugCode: result.debugCode ?? null,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsPending(false);
    }
  };

  const handleVerify = async (payload: ConfirmOtpInput) => {
    setError(null);
    setNotice(null);
    setIsPending(true);
    try {
      const authSession = await loginWithOtp(payload.phone, payload.code);
      clearOtpPending();
      const returnPath =
        next && next.startsWith("/")
          ? next
          : roleHomePath(authSession.activeRole);
      // New accounts go through profile onboarding before landing anywhere.
      if (authSession.isNewUser) {
        router.replace(`/onboarding?next=${encodeURIComponent(returnPath)}`);
        return;
      }
      router.replace(returnPath);
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
      setSession({
        step: "verify",
        phone,
        remainingSeconds: result.expiresInSeconds,
        debugCode: result.debugCode ?? null,
      });
      setNotice(t("resent"));
      setOtpFormKey((current) => current + 1);
      saveOtpPending({
        phone,
        expiresInSeconds: result.expiresInSeconds,
        debugCode: result.debugCode,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  };

  const goBack = () => {
    if (step === "verify") {
      clearOtpPending();
      setSession({
        step: "request",
        phone,
        remainingSeconds: 0,
        debugCode: null,
      });
      setError(null);
      setNotice(null);
      return;
    }
    router.replace(withAuthNext("/auth", next));
  };

  return (
    <AuthLayout
      className={className}
      belowForm={
        step === "request" ? (
          <div className={styles.altBlock()}>
            <div className={styles.divider()}>
              <span className={styles.dividerLine()} />
              <span className={styles.dividerLabel()}>{tAuth("orSignInWith")}</span>
              <span className={styles.dividerLine()} />
            </div>
            <Button
              className={styles.altButton()}
              fullWidth
              size="lg"
              type="button"
              variant="secondary"
              onPress={() => router.push(loginHref)}
            >
              <Lock1 aria-hidden className={styles.altIcon()} size={20} />
              {tAuth("usePasswordInstead")}
            </Button>
          </div>
        ) : null
      }
      footer={
        step === "verify" ? (
          <p>
            <Link
              className={styles.footerLink()}
              onPress={() => router.push(loginHref)}
            >
              <Lock1 size={18} />
              {tAuth("usePasswordInstead")}
            </Link>
          </p>
        ) : null
      }
      heroSrc={HERO_SRC}
      labels={labels}
      tone="plain"
      topStart={
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
      }
    >
      {step === "request" ? (
        <AuthLoginOtpRequestForm
          defaultPhone={phone}
          error={error}
          isPending={isPending}
          onDismissError={() => setError(null)}
          onSubmit={handleRequest}
        />
      ) : (
        <AuthLoginOtpForm
          key={otpFormKey}
          debugCode={debugCode}
          error={error}
          isPending={isPending}
          isResending={isResending}
          notice={notice}
          phone={phone}
          remainingSeconds={remainingSeconds}
          onDismissError={() => setError(null)}
          onResend={() => void handleResend()}
          onSubmit={handleVerify}
        />
      )}
    </AuthLayout>
  );
}
