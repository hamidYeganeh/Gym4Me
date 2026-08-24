import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "@heroui/react/link";
import { Typography } from "@heroui/react/typography";
import { ApiError } from "@repo/api";
import type { RequestOtpInput } from "@repo/api";
import { MediaImage } from "@repo/ui/common/MediaImage";
import { AuthLayout, type AuthLayoutLabels } from "@repo/ui/layout/AuthLayout";
import { useTranslations } from "next-intl";
import { AuthLoginPasswordForm } from "@/modules/auth/components/AuthLoginPasswordForm";
import type { AuthLoginPasswordPayload } from "@/modules/auth/components/AuthLoginPasswordForm";
import { useAuth } from "@/shared/providers/AuthProvider";
import type { OtpRouteState } from "../OtpScreen";
import { signInScreenVariants } from "./SignInScreen.styles";
import type { SignInScreenProps } from "./SignInScreen.types";

const FIGURE_SRC = "/auth/password-secure.png";

export function SignInScreen({ className }: SignInScreenProps) {
  const t = useTranslations("Admin.Auth");
  const styles = signInScreenVariants();
  const { login, requestOtp } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isOtpPending, setIsOtpPending] = useState(false);

  const labels: AuthLayoutLabels = {
    title: t("title"),
    subtitle: t("subtitle"),
    brandAriaLabel: t("brandAriaLabel"),
    heroAlt: t("heroAlt"),
  };

  const handleSubmit = async (payload: AuthLoginPasswordPayload) => {
    setError(null);
    setIsPending(true);
    try {
      await login(payload.phone, payload.password);
      void payload.remember;
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || t("errorInvalid"));
      } else {
        setError(t("errorInvalid"));
      }
    } finally {
      setIsPending(false);
    }
  };

  const handleOtpLogin = async (payload: RequestOtpInput) => {
    setError(null);
    setIsOtpPending(true);
    try {
      const result = await requestOtp(payload.phone);
      const state: OtpRouteState = {
        phone: payload.phone,
        expiresInSeconds: result.expiresInSeconds,
        debugCode: result.debugCode,
      };
      navigate("/otp", { state });
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError(t("errorRateLimited"));
      } else if (err instanceof ApiError && err.status === 403) {
        setError(t("errorAdminAccess"));
      } else if (err instanceof ApiError) {
        setError(err.message || t("errorOtpRequest"));
      } else {
        setError(t("errorOtpRequest"));
      }
    } finally {
      setIsOtpPending(false);
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
      footer={
        <Typography>
          {t("noAccount")}{" "}
          <Link className={styles.forgot()} href="#support">
            {t("contactSupport")}
          </Link>
        </Typography>
      }
    >
      <AuthLoginPasswordForm
        error={error}
        isOtpPending={isOtpPending}
        isPending={isPending}
        onOtpLogin={handleOtpLogin}
        onSubmit={handleSubmit}
      />
    </AuthLayout>
  );
}
