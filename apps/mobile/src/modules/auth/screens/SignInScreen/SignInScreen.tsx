"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Button,
  Input,
  Label,
  Link,
  TextField,
} from "@heroui/react";
import { ApiError } from "@repo/api";
import { ArrowRight, Eye, EyeSlash, Lock1, Telephone1 } from "@repo/icons";
import {
  AuthLayout,
  type AuthLayoutLabels,
} from "@repo/ui/layout/AuthLayout";
import { useTranslations } from "next-intl";
import { saveOtpPending } from "@/modules/auth/lib/otp-pending";
import { roleHomePath } from "@/shared/lib/role-routes";
import { useAuth } from "@/shared/providers/AuthProvider";
import { signInScreenVariants } from "./SignInScreen.styles";
import type { SignInScreenProps } from "./SignInScreen.types";

const HERO_SRC = "/auth-hero.jpg";

export function SignInScreen({ className }: SignInScreenProps) {
  const t = useTranslations("Mobile.Auth");
  const styles = signInScreenVariants();
  const { login, requestOtp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOtpPending, setIsOtpPending] = useState(false);
  const [isPasswordPending, setIsPasswordPending] = useState(false);

  const labels: AuthLayoutLabels = {
    title: t("title"),
    subtitle: t("subtitle"),
    brandAriaLabel: t("brandAriaLabel"),
    heroAlt: t("heroAlt"),
  };

  const afterAuthPath = () => {
    const next = searchParams.get("next");
    if (next && next.startsWith("/")) return next;
    return null;
  };

  const handleOtpLogin = async (event?: FormEvent) => {
    event?.preventDefault();
    setError(null);
    const normalizedPhone = phone.trim();

    if (!normalizedPhone) {
      setError(t("errorPhoneRequired"));
      return;
    }

    setIsOtpPending(true);
    try {
      const result = await requestOtp(normalizedPhone);
      saveOtpPending({
        phone: normalizedPhone,
        expiresInSeconds: result.expiresInSeconds,
        debugCode: result.debugCode,
      });
      const next = afterAuthPath();
      router.push(
        next
          ? `/auth/otp?next=${encodeURIComponent(next)}`
          : "/auth/otp",
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError(t("errorRateLimited"));
      } else if (err instanceof ApiError) {
        setError(err.message || t("errorOtpRequest"));
      } else {
        setError(t("errorOtpRequest"));
      }
    } finally {
      setIsOtpPending(false);
    }
  };

  const handlePasswordLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!phone.trim() || !password) {
      setError(t("errorRequired"));
      return;
    }

    setIsPasswordPending(true);
    try {
      const session = await login(phone.trim(), password);
      router.replace(afterAuthPath() ?? roleHomePath(session.activeRole));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || t("errorInvalid"));
      } else {
        setError(t("errorInvalid"));
      }
    } finally {
      setIsPasswordPending(false);
    }
  };

  return (
    <AuthLayout
      className={className}
      labels={labels}
      heroSrc={HERO_SRC}
      footer={
        <p>
          {t("noAccount")}{" "}
          <Link className={styles.forgot()} href="#support">
            {t("contactSupport")}
          </Link>
        </p>
      }
    >
      <form
        className={styles.form()}
        onSubmit={showPasswordForm ? handlePasswordLogin : handleOtpLogin}
      >
        <TextField
          className={styles.field()}
          fullWidth
          isRequired
          name="phone"
          type="tel"
          value={phone}
          onChange={setPhone}
        >
          <Label>{t("phoneLabel")}</Label>
          <div className={styles.inputWrap()}>
            <Telephone1 className={styles.inputIcon()} size={24} />
            <Input
              autoComplete="tel"
              className={styles.input()}
              placeholder={t("phonePlaceholder")}
            />
          </div>
        </TextField>

        {showPasswordForm ? (
          <TextField
            className={styles.field()}
            fullWidth
            isRequired
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={setPassword}
          >
            <Label>{t("passwordLabel")}</Label>
            <div className={styles.inputWrap()}>
              <Lock1 className={styles.inputIcon()} size={24} />
              <Input
                autoComplete="current-password"
                className={`${styles.input()} ${styles.inputWithSuffix()}`}
                placeholder={t("passwordPlaceholder")}
              />
              <Button
                isIconOnly
                size="lg"
                type="button"
                variant="ghost"
                aria-label={
                  showPassword ? t("hidePassword") : t("showPassword")
                }
                className={styles.suffixButton()}
                onPress={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeSlash size={24} /> : <Eye size={24} />}
              </Button>
            </div>
          </TextField>
        ) : null}

        {error ? (
          <p className={styles.error()} role="alert">
            {error}
          </p>
        ) : null}

        {showPasswordForm ? (
          <Button
            className={styles.submit()}
            fullWidth
            isPending={isPasswordPending}
            size="lg"
            type="submit"
            variant="primary"
          >
            {t("passwordSubmit")}
            <ArrowRight className={styles.submitIcon()} size={24} />
          </Button>
        ) : (
          <Button
            className={styles.submit()}
            fullWidth
            isPending={isOtpPending}
            size="lg"
            type="submit"
            variant="primary"
          >
            <Telephone1 size={22} />
            {t("otpSubmit")}
          </Button>
        )}

        <div className={styles.divider()}>
          <span className={styles.dividerLine()} />
          <span>{t("or")}</span>
          <span className={styles.dividerLine()} />
        </div>

        <Button
          className={styles.passwordSubmit()}
          fullWidth
          size="lg"
          type="button"
          variant="secondary"
          onPress={() => {
            setError(null);
            setShowPasswordForm((prev) => !prev);
          }}
        >
          {showPasswordForm ? t("useOtpInstead") : t("usePasswordInstead")}
        </Button>
      </form>
    </AuthLayout>
  );
}
