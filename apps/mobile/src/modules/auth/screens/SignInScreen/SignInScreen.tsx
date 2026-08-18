"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Link, Typography } from "@heroui/react";
import { ApiError } from "@repo/api";
import { Chat, ChevronLeft } from "@repo/icons";
import { toast } from "@repo/ui/kit/Toast";
import {
  AuthLayout,
  type AuthLayoutLabels,
} from "@repo/ui/layout/AuthLayout";
import { useTranslations } from "next-intl";
import { AuthLoginPasswordForm } from "@/modules/auth/components/AuthLoginPasswordForm";
import type { AuthLoginPasswordPayload } from "@/modules/auth/components/AuthLoginPasswordForm";
import { withAuthNext } from "@/shared/lib/auth-redirect";
import { roleHomePath } from "@/shared/lib/role-routes";
import { useAuth } from "@/shared/providers/AuthProvider";
import { signInScreenVariants } from "./SignInScreen.styles";
import type { SignInScreenProps } from "./SignInScreen.types";

const HERO_SRC = "/auth-hero.jpg";

export function SignInScreen({ className }: SignInScreenProps) {
  const t = useTranslations("Mobile.Auth");
  const styles = signInScreenVariants();
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);

  const next = searchParams.get("next");
  const otpHref = withAuthNext("/auth/otp", next);

  const labels: AuthLayoutLabels = {
    subtitle: t("subtitle"),
    brandAriaLabel: t("brandAriaLabel"),
    heroAlt: t("heroAlt"),
  };

  const handleSubmit = async (payload: AuthLoginPasswordPayload) => {
    setIsPending(true);
    try {
      const session = await login(payload.phone, payload.password);
      void payload.remember;
      router.replace(
        next && next.startsWith("/")
          ? next
          : roleHomePath(session.activeRole),
      );
    } catch (err) {
      toast.error(t("toastErrorTitle"), {
        description:
          err instanceof ApiError
            ? err.message || t("errorInvalid")
            : t("errorInvalid"),
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AuthLayout
      className={className}
      belowForm={
        <div className={styles.altBlock()}>
          <div className={styles.divider()}>
            <span className={styles.dividerLine()} />
            <span className={styles.dividerLabel()}>{t("orSignInWith")}</span>
            <span className={styles.dividerLine()} />
          </div>
          <Button
            className={styles.altButton()}
            fullWidth
            size="lg"
            type="button"
            variant="secondary"
            onPress={() => router.push(otpHref)}
          >
            <Chat aria-hidden className={styles.altIcon()} size={20} />
            {t("useOtpInstead")}
          </Button>
        </div>
      }
      footer={
        <Typography className={styles.footer()} type="body-sm">
          {t("noAccount")}{" "}
          <Link
            className={styles.footerLink()}
            onPress={() => router.push(otpHref)}
          >
            {t("signUp")}
          </Link>
        </Typography>
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
          onPress={() => router.replace(withAuthNext("/auth", next))}
        >
          <ChevronLeft size={22} />
        </Button>
      }
    >
      <AuthLoginPasswordForm
        isPending={isPending}
        onForgotPassword={() =>
          router.push(withAuthNext("/auth/forgot-password", next))
        }
        onSubmit={handleSubmit}
      />
    </AuthLayout>
  );
}
