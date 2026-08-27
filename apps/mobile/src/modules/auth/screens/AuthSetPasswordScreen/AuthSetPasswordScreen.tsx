"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ApiError } from "@repo/api";
import type { SetPasswordInput } from "@repo/api";
import { MediaImage } from "@repo/ui/common/MediaImage";
import { toast } from "@repo/ui/kit/Toast";
import {
  AuthLayout,
  type AuthLayoutLabels,
} from "@repo/ui/layout/AuthLayout";
import { useTranslations } from "next-intl";
import { AuthSetPasswordForm } from "@/modules/auth/components/AuthSetPasswordForm";
import { accountAuth } from "@/shared/lib/api-client";
import { accountProfile } from "@/shared/lib/api";
import { postAuthPath } from "@/shared/lib/auth-redirect";
import { useRouter } from "@/shared/lib/app-router";
import { useAuth } from "@/shared/providers/AuthProvider";
import { authSetPasswordScreenVariants } from "./AuthSetPasswordScreen.styles";
import type { AuthSetPasswordScreenProps } from "./AuthSetPasswordScreen.types";

const FIGURE_SRC = "/auth/password-secure.png";

export function AuthSetPasswordScreen({ className }: AuthSetPasswordScreenProps) {
  const t = useTranslations("Mobile.SetPassword");
  const tAuth = useTranslations("Mobile.Auth");
  const styles = authSetPasswordScreenVariants();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser, session } = useAuth();
  const [isPending, setIsPending] = useState(false);

  const next = searchParams.get("next");

  const labels: AuthLayoutLabels = {
    title: t("title"),
    subtitle: t("subtitle"),
    brandAriaLabel: t("brandAriaLabel"),
    heroAlt: t("heroAlt"),
  };

  const handleSubmit = async (payload: SetPasswordInput) => {
    setIsPending(true);
    try {
      await accountAuth.setPassword(payload);
      const user = await accountProfile.getMe();
      refreshUser(user);
      router.replace(
        postAuthPath(
          {
            activeRole: session?.activeRole,
            isNewUser: session?.isNewUser,
            user,
          },
          next,
        ),
      );
    } catch (err) {
      if (!(err instanceof ApiError)) {
        toast.error(tAuth("toastErrorTitle"), { description: t("errorSet") });
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AuthLayout
      className={className}
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
    >
      <AuthSetPasswordForm
        isPending={isPending}
        onSubmit={handleSubmit}
        requireCurrentPassword={false}
        showReloginNote={false}
      />
    </AuthLayout>
  );
}
