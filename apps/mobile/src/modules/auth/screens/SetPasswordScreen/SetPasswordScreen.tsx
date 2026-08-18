"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Link, Typography } from "@heroui/react";
import { ApiError } from "@repo/api";
import type { SetPasswordInput } from "@repo/api";
import { ChevronLeft } from "@repo/icons";
import { toast } from "@repo/ui/kit/Toast";
import {
  AuthLayout,
  type AuthLayoutLabels,
} from "@repo/ui/layout/AuthLayout";
import { useTranslations } from "next-intl";
import { AuthSetPasswordForm } from "@/modules/auth/components/AuthSetPasswordForm";
import { accountAuth } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { setPasswordScreenVariants } from "./SetPasswordScreen.styles";
import type { SetPasswordScreenProps } from "./SetPasswordScreen.types";

export function SetPasswordScreen({
  className,
  roleSegment = "athlete",
}: SetPasswordScreenProps) {
  const t = useTranslations("Mobile.SetPassword");
  const tAuth = useTranslations("Mobile.Auth");
  const styles = setPasswordScreenVariants();
  const router = useRouter();
  const { logout } = useAuth();

  const [isPending, setIsPending] = useState(false);

  const labels: AuthLayoutLabels = {
    subtitle: t("subtitle"),
    brandAriaLabel: t("brandAriaLabel"),
    heroAlt: t("heroAlt"),
  };

  const handleSubmit = async (payload: SetPasswordInput) => {
    setIsPending(true);
    try {
      await accountAuth.setPassword(payload);
      await logout({ revoke: true });
      router.replace("/auth/login");
    } catch (err) {
      const description =
        err instanceof ApiError && err.status === 401
          ? t("errorCurrentInvalid")
          : err instanceof ApiError && err.message
            ? err.message
            : t("errorSet");
      toast.error(tAuth("toastErrorTitle"), { description });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AuthLayout
      className={className}
      footer={
        <Typography type="body-sm">
          <Link
            className={styles.footerLink()}
            onPress={() => router.push(`/${roleSegment}/profile/security`)}
          >
            {t("backToSecurity")}
          </Link>
        </Typography>
      }
      labels={labels}
      tone="dark"
      topStart={
        <Button
          aria-label={t("back")}
          className={styles.backButton()}
          isIconOnly
          size="lg"
          type="button"
          variant="ghost"
          onPress={() => router.push(`/${roleSegment}/profile/security`)}
        >
          <ChevronLeft size={22} />
        </Button>
      }
    >
      <Typography className={styles.notice()} type="body-sm">
        {t("reloginNote")}
      </Typography>
      <AuthSetPasswordForm
        isPending={isPending}
        onSubmit={handleSubmit}
      />
    </AuthLayout>
  );
}
