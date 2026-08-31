"use client";

import { useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button } from "@heroui/react/button";
import { FieldError } from "@heroui/react/field-error";
import { Typography } from "@heroui/react/typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "@repo/icons/ArrowRight";
import { InputOTP } from "@repo/ui/kit/InputOTP";
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

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes.toLocaleString("fa-IR")}:${remainder
    .toLocaleString("fa-IR", { minimumIntegerDigits: 2 })
    .replace(/\u200e/g, "")}`;
}

export function AuthForgotPasswordOtpForm({
  className,
  phone,
  debugCode = null,
  remainingSeconds,
  isPending = false,
  onSubmit,
  onResend,
}: AuthForgotPasswordOtpFormProps) {
  const t = useTranslations("Mobile.ForgotPassword");
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

  const code = useWatch({ control: form.control, name: "code" }) ?? "";

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(toAuthForgotPasswordOtpPayload(values, phone));
  });

  return (
    <form autoComplete="off" className={styles.form({ className })} onSubmit={handleSubmit}>
      <Typography className={styles.hint()} type="body-sm">
        {t("sentTo")}{" "}
        <Typography
          className={styles.phoneValue()}
          render={({ children, ...domProps }) => (
            <span {...domProps}>{children}</span>
          )}
          weight="bold"
        >
          {phone}
        </Typography>
      </Typography>

      {debugCode ? (
        <Typography className={styles.hint()} type="body-sm">
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
              isInvalid={fieldState.invalid}
              length={OTP_LENGTH}
              pattern={OTP_PATTERN}
              size="md"
              value={field.value}
              onBlur={field.onBlur}
              onChange={(value) => field.onChange(normalizeOtpDigits(value))}
            />
            <FieldError>{fieldState.error?.message}</FieldError>
          </div>
        )}
      />

      <Button
        className={styles.submit()}
        fullWidth
        isDisabled={code.length !== OTP_LENGTH}
        isPending={isPending}
        size="lg"
        type="submit"
        variant="primary"
      >
        {t("confirmCode")}
        <ArrowRight className={styles.submitIcon()} size={20} />
      </Button>

      <div className={styles.resendRow()}>
        {remainingSeconds > 0 ? (
          <>
            <Typography type="body-sm">{t("resendIn", { seconds: remainingSeconds })}</Typography>
            <Typography className={styles.timer()} type="body-sm" weight="bold">
              {formatTimer(remainingSeconds)}
            </Typography>
          </>
        ) : (
          <Button
            className={styles.resend()}
            isPending={isPending}
            size="lg"
            type="button"
            variant="ghost"
            onPress={onResend}
          >
            {t("resend")}
          </Button>
        )}
      </div>
    </form>
  );
}
