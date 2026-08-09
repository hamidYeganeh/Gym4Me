"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Button,
  Checkbox,
  Input,
  Label,
  Link,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  type Key,
} from "@heroui/react";
import { ApiError } from "@repo/api";
import {
  ArrowRight,
  CloseX,
  Eye,
  EyeSlash,
  Lock1,
  Telephone1,
} from "@repo/icons";
import {
  AuthLayout,
  type AuthLayoutLabels,
} from "@repo/ui/layout/AuthLayout";
import { useTranslations } from "next-intl";
import { saveOtpPending } from "@/modules/auth/lib/otp-pending";
import { roleHomePath } from "@/shared/lib/role-routes";
import { useAuth } from "@/shared/providers/AuthProvider";
import { signInScreenVariants } from "./SignInScreen.styles";
import type { SignInMode, SignInScreenProps } from "./SignInScreen.types";

export function SignInScreen({ className }: SignInScreenProps) {
  const t = useTranslations("Mobile.Auth");
  const styles = signInScreenVariants();
  const { login, requestOtp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<SignInMode>("password");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const labels: AuthLayoutLabels = {
    subtitle: t("subtitle"),
    brandAriaLabel: t("brandAriaLabel"),
    heroAlt: t("heroAlt"),
  };

  const afterAuthPath = () => {
    const next = searchParams.get("next");
    if (next && next.startsWith("/")) return next;
    return null;
  };

  const handleModeChange = (keys: Set<Key>) => {
    const next = [...keys][0];
    if (next === "password" || next === "otp") {
      setError(null);
      setMode(next);
    }
  };

  const handleOtpLogin = async (event?: FormEvent) => {
    event?.preventDefault();
    setError(null);
    const normalizedPhone = phone.trim();

    if (!normalizedPhone) {
      setError(t("errorPhoneRequired"));
      return;
    }

    setIsPending(true);
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
      setIsPending(false);
    }
  };

  const handlePasswordLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!phone.trim() || !password) {
      setError(t("errorRequired"));
      return;
    }

    setIsPending(true);
    try {
      const session = await login(phone.trim(), password);
      // remember flag reserved for longer refresh TTL once API supports it
      void remember;
      router.replace(afterAuthPath() ?? roleHomePath(session.activeRole));
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

  return (
    <AuthLayout
      className={className}
      labels={labels}
      footer={
        <p>
          {t("noAccount")}{" "}
          <Link
            className={styles.footerLink()}
            href="#otp"
            onPress={() => {
              setError(null);
              setMode("otp");
            }}
          >
            {t("signUp")}
          </Link>
        </p>
      }
    >
      <form
        className={styles.form()}
        onSubmit={mode === "password" ? handlePasswordLogin : handleOtpLogin}
      >
        <ToggleButtonGroup
          aria-label={t("modeLabel")}
          className={styles.modeGroup()}
          disallowEmptySelection
          fullWidth
          selectedKeys={new Set([mode])}
          selectionMode="single"
          size="lg"
          onSelectionChange={handleModeChange}
        >
          <ToggleButton className={styles.modeButton()} id="password">
            {t("modePassword")}
          </ToggleButton>
          <ToggleButton className={styles.modeButton()} id="otp">
            <ToggleButtonGroup.Separator />
            {t("modeOtp")}
          </ToggleButton>
        </ToggleButtonGroup>

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
            <Telephone1 className={styles.inputIcon()} size={22} />
            <Input
              autoComplete="tel"
              className={styles.input()}
              placeholder={t("phonePlaceholder")}
            />
          </div>
        </TextField>

        {mode === "password" ? (
          <>
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
                <Lock1 className={styles.inputIcon()} size={22} />
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
                  {showPassword ? <EyeSlash size={22} /> : <Eye size={22} />}
                </Button>
              </div>
            </TextField>

            <div className={styles.row()}>
              <Checkbox
                isSelected={remember}
                name="remember"
                onChange={setRemember}
              >
                <Checkbox.Content>
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <span className={styles.remember()}>{t("remember")}</span>
                </Checkbox.Content>
              </Checkbox>

              <Link className={styles.forgot()} href="#support">
                {t("forgotPassword")}
              </Link>
            </div>
          </>
        ) : null}

        {error ? (
          <div className={styles.errorBanner()} role="alert">
            <span>
              {t("errorPrefix")} {error}
            </span>
            <Button
              isIconOnly
              size="lg"
              type="button"
              variant="ghost"
              aria-label={t("dismissError")}
              className={styles.errorDismiss()}
              onPress={() => setError(null)}
            >
              <CloseX size={18} />
            </Button>
          </div>
        ) : null}

        <Button
          className={styles.submit()}
          fullWidth
          isPending={isPending}
          size="lg"
          type="submit"
          variant="primary"
        >
          {mode === "password" ? t("passwordSubmit") : t("otpSubmit")}
          <ArrowRight className={styles.submitIcon()} size={22} />
        </Button>
      </form>
    </AuthLayout>
  );
}
