import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@heroui/react/button";
import { FieldError } from "@heroui/react/field-error";
import { InputOTP } from "@heroui/react/input-otp";
import { Typography } from "@heroui/react/typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  normalizeOtpDigits,
  OTP_LENGTH,
  OTP_PATTERN,
} from "@/modules/auth/lib/phone";
import {
  authForgotPasswordOtpFormDefaults,
  createAuthForgotPasswordOtpFormSchema,
  toAuthForgotPasswordOtpPayload,
  type AuthForgotPasswordOtpFormValues,
} from "./AuthForgotPasswordOtpForm.schema";
import { authForgotPasswordOtpFormVariants } from "./AuthForgotPasswordOtpForm.styles";
import type { AuthForgotPasswordOtpFormProps } from "./AuthForgotPasswordOtpForm.types";

export function AuthForgotPasswordOtpForm({
  className,
  phone,
  debugCode = null,
  remainingSeconds,
  error = null,
  isPending = false,
  isResending = false,
  onSubmit,
  onResend,
}: AuthForgotPasswordOtpFormProps) {
  const t = useTranslations("Admin.ForgotPassword");
  const styles = authForgotPasswordOtpFormVariants();

  const schema = useMemo(
    () =>
      createAuthForgotPasswordOtpFormSchema({
        codeRequired: t("validation.codeRequired"),
        codeInvalid: t("validation.codeInvalid"),
      }),
    [t],
  );

  const form = useForm<AuthForgotPasswordOtpFormValues>({
    resolver: zodResolver(schema),
    defaultValues: authForgotPasswordOtpFormDefaults,
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(toAuthForgotPasswordOtpPayload(values, phone));
  });

  return (
    <form autoComplete="off" className={styles.form({ className })} onSubmit={handleSubmit}>
      <Typography className={styles.hint()}>
        {t("sentTo")} <span dir="ltr">{phone}</span>
      </Typography>

      {debugCode ? (
        <Typography className={styles.hint()}>
          {t("debugLabel")}: <span dir="ltr">{debugCode}</span>
        </Typography>
      ) : null}

      <Controller
        control={form.control}
        name="code"
        render={({ field, fieldState }) => (
          <div className={styles.otpWrap()}>
            <InputOTP
              autoFocus
              inputMode="numeric"
              maxLength={OTP_LENGTH}
              pattern={OTP_PATTERN}
              value={field.value}
              onBlur={field.onBlur}
              onChange={(value) => field.onChange(normalizeOtpDigits(value))}
            >
              <InputOTP.Group>
                {Array.from({ length: OTP_LENGTH }, (_, index) => (
                  <InputOTP.Slot key={index} index={index} />
                ))}
              </InputOTP.Group>
            </InputOTP>
            <FieldError>{fieldState.error?.message}</FieldError>
          </div>
        )}
      />

      {error ? (
        <Typography className={styles.error()} role="alert">
          {error}
        </Typography>
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
        isPending={isResending}
        size="lg"
        type="button"
        variant="secondary"
        onPress={onResend}
      >
        {remainingSeconds > 0
          ? t("resendIn", { seconds: remainingSeconds })
          : t("resend")}
      </Button>
    </form>
  );
}
