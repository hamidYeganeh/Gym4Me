"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Link } from "@heroui/react";
import { ApiError } from "@repo/api";
import type { SetPasswordInput } from "@repo/api";
import { ChevronLeft } from "@repo/icons";
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
  const styles = setPasswordScreenVariants();
  const router = useRouter();
  const { logout } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const labels: AuthLayoutLabels = {
    subtitle: t("subtitle"),
    brandAriaLabel: t("brandAriaLabel"),
    heroAlt: t("heroAlt"),
  };

  const handleSubmit = async (payload: SetPasswordInput) => {
    setError(null);
    setIsPending(true);
    try {
      await accountAuth.setPassword(payload);
      await logout({ revoke: true });
      router.replace("/auth/login");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError(t("errorCurrentInvalid"));
      } else if (err instanceof ApiError && err.message) {
        setError(err.message);
      } else {
        setError(t("errorSet"));
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AuthLayout
      className={className}
      footer={
        <p>
          <Link
            className={styles.footerLink()}
            onPress={() => router.push(`/${roleSegment}/profile/security`)}
          >
            {t("backToSecurity")}
          </Link>
        </p>
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
      <p className={styles.notice()}>{t("reloginNote")}</p>
      <AuthSetPasswordForm
        error={error}
        isPending={isPending}
        onSubmit={handleSubmit}
      />
    </AuthLayout>
  );
}
