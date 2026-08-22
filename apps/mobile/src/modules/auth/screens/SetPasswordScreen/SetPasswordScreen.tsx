"use client";

import { useState } from "react";
import { useRouter } from "@/shared/lib/app-router";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ApiError } from "@repo/api";
import type { SetPasswordInput } from "@repo/api";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { toast } from "@repo/ui/kit/Toast";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { AuthSetPasswordForm } from "@/modules/auth/components/AuthSetPasswordForm";
import { accountAuth } from "@/shared/lib/api-client";
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

  const handleSubmit = async (payload: SetPasswordInput) => {
    setIsPending(true);
    try {
      await accountAuth.setPassword(payload);
      await logout({ revoke: true });
      router.replace("/auth/login");
    } catch (err) {
      if (!(err instanceof ApiError)) {
        toast.error(tAuth("toastErrorTitle"), { description: t("errorSet") });
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <Header
          appearance="bar"
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.push(`/${roleSegment}/profile/security`)}
              size="lg"
              variant="tertiary"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
          title={t("title")}
        />
      }
    >
      <div className={styles.content()}>
        <Typography className={styles.notice()} type="body-sm">
          {t("reloginNote")}
        </Typography>
        <AuthSetPasswordForm isPending={isPending} onSubmit={handleSubmit} />
      </div>
    </AppLayout>
  );
}
