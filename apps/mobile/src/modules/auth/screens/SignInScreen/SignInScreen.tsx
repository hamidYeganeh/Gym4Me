"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@heroui/react/button";
import { ApiError } from "@repo/api";
import { Chat } from "@repo/icons/Chat";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { MediaImage } from "@repo/ui/common/MediaImage";
import { toast } from "@repo/ui/kit/Toast";
import {
  AuthLayout,
  type AuthLayoutLabels,
} from "@repo/ui/layout/AuthLayout";
import { useTranslations } from "next-intl";
import { AuthLoginPasswordForm } from "@/modules/auth/components/AuthLoginPasswordForm";
import type { AuthLoginPasswordPayload } from "@/modules/auth/components/AuthLoginPasswordForm";
import { OtpScreenAltAuthSection } from "@/modules/auth/sections/OtpScreenAltAuthSection";
import { postAuthPath, withAuthNext } from "@/shared/lib/auth-redirect";
import { useAuth } from "@/shared/providers/AuthProvider";
import { signInScreenVariants } from "./SignInScreen.styles";
import type { SignInScreenProps } from "./SignInScreen.types";
import { useRouter } from "@/shared/lib/app-router";

const FIGURE_SRC = "/auth/password-secure.png";

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
    title: t("passwordTitle"),
    subtitle: t("passwordSubtitle"),
    brandAriaLabel: t("brandAriaLabel"),
    heroAlt: t("heroAlt"),
  };

  const handleSubmit = async (payload: AuthLoginPasswordPayload) => {
    setIsPending(true);
    try {
      const session = await login(payload.phone, payload.password);
      void payload.remember;
      router.replace(postAuthPath(session, next));
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
        <OtpScreenAltAuthSection
          buttonLabel={t("useOtpInstead")}
          dividerLabel={t("orSignInWith")}
          icon={<Chat size={20} />}
          onPress={() => router.push(otpHref)}
        />
      }
      figure={
        <MediaImage
          alt=""
          aria-hidden
          className={styles.figureImage()}
          image={FIGURE_SRC}
          priority
          sizes="208px"
        />
      }
      framed={false}
      labels={labels}
      showBrand={false}
      tone="plain"
      topStart={
        <Button
          aria-label={t("back")}
          className={styles.backButton()}
          isIconOnly
          onPress={() => router.replace(withAuthNext("/auth", next))}
          size="lg"
          type="button"
          variant="tertiary"
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
