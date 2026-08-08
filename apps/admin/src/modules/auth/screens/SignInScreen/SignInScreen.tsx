import { useState, type FormEvent } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Button,
  Checkbox,
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
import { routes } from "@/shared/lib/routes";
import { useAuth } from "@/shared/providers/AuthProvider";
import type { OtpRouteState } from "../OtpScreen";
import { signInScreenVariants } from "./SignInScreen.styles";
import type { SignInScreenProps } from "./SignInScreen.types";

const HERO_SRC = "/assets/images/auth-hero.jpg";

export function SignInScreen({ className }: SignInScreenProps) {
  const t = useTranslations("Admin.Auth");
  const styles = signInScreenVariants();
  const { login, requestOtp } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isOtpPending, setIsOtpPending] = useState(false);

  const labels: AuthLayoutLabels = {
    title: t("title"),
    subtitle: t("subtitle"),
    brandAriaLabel: t("brandAriaLabel"),
    heroAlt: t("heroAlt"),
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!phone.trim() || !password) {
      setError(t("errorRequired"));
      return;
    }

    setIsPending(true);
    try {
      await login(phone.trim(), password);
      // remember flag reserved for longer refresh TTL once API supports it
      void remember;
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

  const handleOtpLogin = async () => {
    setError(null);
    const normalizedPhone = phone.trim();

    if (!normalizedPhone) {
      setError(t("errorPhoneRequired"));
      return;
    }

    setIsOtpPending(true);
    try {
      const result = await requestOtp(normalizedPhone);
      const state: OtpRouteState = {
        phone: normalizedPhone,
        expiresInSeconds: result.expiresInSeconds,
        debugCode: result.debugCode,
      };
      navigate("/otp", { state });
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
      <form className={styles.form()} onSubmit={handleSubmit}>
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

          <RouterLink className={styles.forgot()} to={routes.forgotPassword}>
            {t("forgotPassword")}
          </RouterLink>
        </div>

        {error ? (
          <p className={styles.error()} role="alert">
            {error}
          </p>
        ) : null}

        <Button
          className={styles.submit()}
          fullWidth
          isPending={isPending}
          size="lg"
          type="submit"
          variant="primary"
        >
          {t("submit")}
          <ArrowRight className={styles.submitIcon()} size={24} />
        </Button>

        <div className={styles.divider()}>
          <span className={styles.dividerLine()} />
          <span>{t("or")}</span>
          <span className={styles.dividerLine()} />
        </div>

        <Button
          className={styles.otpSubmit()}
          fullWidth
          isPending={isOtpPending}
          size="lg"
          type="button"
          variant="secondary"
          onPress={handleOtpLogin}
        >
          <Telephone1 size={22} />
          {t("otpSubmit")}
        </Button>
      </form>
    </AuthLayout>
  );
}
