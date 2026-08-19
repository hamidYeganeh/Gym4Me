"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError } from "@repo/api";
import type { ConfirmOtpInput, RequestOtpInput } from "@repo/api";
import { toast } from "@repo/ui/kit/Toast";
import type { AuthLayoutLabels } from "@repo/ui/layout/AuthLayout";
import { useTranslations } from "next-intl";
import {
  clearOtpPending,
  readOtpPending,
  saveOtpPending,
  type OtpPendingState,
} from "@/modules/auth/lib/otp-pending";
import { postAuthPath, withAuthNext } from "@/shared/lib/auth-redirect";
import { useAuth } from "@/shared/providers/AuthProvider";

const subscribeOtpPending = () => () => {};

function getOtpPendingSnapshot() {
  return readOtpPending();
}

function getOtpPendingServerSnapshot(): OtpPendingState | null {
  return null;
}

export function maskPhone(phone: string) {
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

export function useOtpScreen() {
  const t = useTranslations("Mobile.Otp");
  const tAuth = useTranslations("Mobile.Auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithOtp, requestOtp } = useAuth();

  const storedPending = useSyncExternalStore(
    subscribeOtpPending,
    getOtpPendingSnapshot,
    getOtpPendingServerSnapshot,
  );

  const [session, setSession] = useState<OtpSession | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otpFormKey, setOtpFormKey] = useState(0);

  const active = session ?? sessionFromPending(storedPending);
  const { step, phone, remainingSeconds, debugCode } = active;

  const next = searchParams.get("next");
  const loginHref = withAuthNext("/auth/login", next);

  useEffect(() => {
    if (step !== "verify" || !phone) return;
    const timer = window.setInterval(() => {
      setSession((current) => {
        const base = current ?? sessionFromPending(readOtpPending());
        if (base.step !== "verify" || base.remainingSeconds <= 0)
          return current ?? base;
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
          title: t("title"),
          subtitle: t("sentToMasked", { phone: maskPhone(phone) }),
          brandAriaLabel: t("brandAriaLabel"),
          heroAlt: t("heroAlt"),
        }
      : {
          title: t("requestTitle"),
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

  const notifyError = (err: unknown) => {
    toast.error(tAuth("toastErrorTitle"), {
      description: getErrorMessage(err),
    });
  };

  const handleRequest = async (payload: RequestOtpInput) => {
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
      notifyError(err);
    } finally {
      setIsPending(false);
    }
  };

  const handleVerify = async (payload: ConfirmOtpInput) => {
    setIsPending(true);
    try {
      const authSession = await loginWithOtp(payload.phone, payload.code);
      clearOtpPending();
      // isNewUser → /onboarding; otherwise → /{role} (or ?next= deep link).
      router.replace(postAuthPath(authSession, next));
    } catch (err) {
      notifyError(err);
    } finally {
      setIsPending(false);
    }
  };

  const handleResend = async () => {
    if (remainingSeconds > 0 || isResending) return;
    setIsResending(true);
    try {
      const result = await requestOtp(phone);
      setSession({
        step: "verify",
        phone,
        remainingSeconds: result.expiresInSeconds,
        debugCode: result.debugCode ?? null,
      });
      toast.success(tAuth("toastSuccessTitle"), {
        description: t("resent"),
      });
      setOtpFormKey((current) => current + 1);
      saveOtpPending({
        phone,
        expiresInSeconds: result.expiresInSeconds,
        debugCode: result.debugCode,
      });
    } catch (err) {
      notifyError(err);
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
      return;
    }
    router.replace(withAuthNext("/auth", next));
  };

  return {
    t,
    tAuth,
    step,
    phone,
    remainingSeconds,
    debugCode,
    isPending,
    isResending,
    otpFormKey,
    loginHref,
    labels,
    goBack,
    handleRequest,
    handleVerify,
    handleResend,
    navigateToLogin: () => router.push(loginHref),
  };
}

export type UseOtpScreenReturn = ReturnType<typeof useOtpScreen>;
