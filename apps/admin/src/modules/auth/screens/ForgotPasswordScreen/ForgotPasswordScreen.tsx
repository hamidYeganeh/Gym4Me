import { useEffect, useState, type FormEvent } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  InputOTP,
  Label,
  TextField,
} from "@heroui/react";
import { ApiError } from "@repo/api";
import { ArrowRight, Eye, EyeSlash, Lock1, Telephone1 } from "@repo/icons";
import {
  AuthLayout,
  type AuthLayoutLabels,
} from "@repo/ui/layout/AuthLayout";
import { useTranslations } from "next-intl";
import { adminAuth } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { forgotPasswordScreenVariants } from "./ForgotPasswordScreen.styles";
import type {
  ForgotPasswordScreenProps,
  ForgotPasswordStep,
} from "./ForgotPasswordScreen.types";

const HERO_SRC = "/assets/images/auth-hero.jpg";
const OTP_LENGTH = 5;
const OTP_PATTERN = "^[0-9۰-۹٠-٩]+$";

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/\D/g, "")
    .slice(0, OTP_LENGTH);
}

export function ForgotPasswordScreen({ className }: ForgotPasswordScreenProps) {
  const t = useTranslations("Admin.ForgotPassword");
  const styles = forgotPasswordScreenVariants();
  const navigate = useNavigate();

  const [step, setStep] = useState<ForgotPasswordStep>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (step !== "otp") return;
    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [step]);

  const labels: AuthLayoutLabels = {
    title: t(`steps.${step}.title`),
    subtitle: t(`steps.${step}.subtitle`),
    brandAriaLabel: t("brandAriaLabel"),
    heroAlt: t("heroAlt"),
  };

  const requestCode = async () => {
    setError(null);
    const normalized = phone.trim();
    if (!normalized) {
      setError(t("errorPhoneRequired"));
      return;
    }
    setIsPending(true);
    try {
      const result = await adminAuth.forgotPassword({ phone: normalized });
      setPhone(normalized);
      setRemainingSeconds(result.expiresInSeconds);
      setDebugCode(result.debugCode ?? null);
      setCode("");
      setStep("otp");
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError(t("errorRateLimited"));
      } else if (err instanceof ApiError) {
        setError(err.message || t("errorRequest"));
      } else {
        setError(t("errorRequest"));
      }
    } finally {
      setIsPending(false);
    }
  };

  const confirmCode = async () => {
    setError(null);
    const normalized = normalizeDigits(code);
    if (normalized.length !== OTP_LENGTH) {
      setError(t("errorOtpRequired"));
      return;
    }
    setIsPending(true);
    try {
      const result = await adminAuth.forgotPasswordConfirm({
        phone,
        code: normalized,
      });
      setResetToken(result.resetToken);
      setStep("reset");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || t("errorOtpInvalid"));
      } else {
        setError(t("errorOtpInvalid"));
      }
    } finally {
      setIsPending(false);
    }
  };

  const submitPassword = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError(t("errorPasswordShort"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("errorPasswordMismatch"));
      return;
    }
    setIsPending(true);
    try {
      await adminAuth.resetPassword({ resetToken, password });
      setStep("done");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || t("errorReset"));
      } else {
        setError(t("errorReset"));
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AuthLayout
      className={className}
      heroSrc={HERO_SRC}
      labels={labels}
      footer={
        <RouterLink className={styles.back()} to={routes.signIn}>
          {t("backToSignIn")}
        </RouterLink>
      }
    >
      {step === "phone" ? (
        <form
          className={styles.form()}
          onSubmit={(event) => {
            event.preventDefault();
            void requestCode();
          }}
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
            {t("sendCode")}
            <ArrowRight size={24} />
          </Button>
        </form>
      ) : null}

      {step === "otp" ? (
        <form
          className={styles.form()}
          onSubmit={(event) => {
            event.preventDefault();
            void confirmCode();
          }}
        >
          <p className={styles.hint()}>
            {t("sentTo")} <span dir="ltr">{phone}</span>
          </p>
          {debugCode ? (
            <p className={styles.hint()}>
              {t("debugLabel")}: <span dir="ltr">{debugCode}</span>
            </p>
          ) : null}
          <div className={styles.otpWrap()}>
            <InputOTP
              autoFocus
              inputMode="numeric"
              maxLength={OTP_LENGTH}
              pattern={OTP_PATTERN}
              value={code}
              onChange={(value) => setCode(normalizeDigits(value))}
            >
              <InputOTP.Group>
                {Array.from({ length: OTP_LENGTH }, (_, index) => (
                  <InputOTP.Slot key={index} index={index} />
                ))}
              </InputOTP.Group>
            </InputOTP>
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
            {t("confirmCode")}
          </Button>
          <Button
            fullWidth
            isDisabled={remainingSeconds > 0}
            isPending={isPending}
            size="lg"
            type="button"
            variant="secondary"
            onPress={() => void requestCode()}
          >
            {remainingSeconds > 0
              ? t("resendIn", { seconds: remainingSeconds })
              : t("resend")}
          </Button>
        </form>
      ) : null}

      {step === "reset" ? (
        <form className={styles.form()} onSubmit={submitPassword}>
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
                autoComplete="new-password"
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
          <TextField
            className={styles.field()}
            fullWidth
            isRequired
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={setConfirmPassword}
          >
            <Label>{t("confirmPasswordLabel")}</Label>
            <div className={styles.inputWrap()}>
              <Lock1 className={styles.inputIcon()} size={24} />
              <Input
                autoComplete="new-password"
                className={styles.input()}
                placeholder={t("passwordPlaceholder")}
              />
            </div>
          </TextField>
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
            {t("savePassword")}
          </Button>
        </form>
      ) : null}

      {step === "done" ? (
        <div className={styles.form()}>
          <p className={styles.success()}>{t("success")}</p>
          <Button
            className={styles.submit()}
            fullWidth
            size="lg"
            variant="primary"
            onPress={() => navigate(routes.signIn, { replace: true })}
          >
            {t("backToSignIn")}
          </Button>
        </div>
      ) : null}
    </AuthLayout>
  );
}
