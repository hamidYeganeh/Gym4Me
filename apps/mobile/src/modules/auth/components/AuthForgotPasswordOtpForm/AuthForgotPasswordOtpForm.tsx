"use client";

import { useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button, FieldError, InputOTP } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "@repo/icons";
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
  error = null,
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
    <form className={styles.form({ className })} onSubmit={handleSubmit}>
      <p className={styles.hint()}>
        {t("sentTo")}{" "}
        <b className={styles.phoneValue()}>{phone}</b>
      </p>

      {debugCode ? (
        <p className={styles.hint()}>
          {t("debugLabel")}: <span dir="ltr">{debugCode}</span>
        </p>
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
              <InputOTP.Group className={styles.otpGroup()}>
                {Array.from({ length: OTP_LENGTH }, (_, index) => (
                  <InputOTP.Slot
                    className={styles.otpSlot()}
                    index={index}
                    key={index}
                  />
                ))}
              </InputOTP.Group>
            </InputOTP>
            <FieldError>{fieldState.error?.message}</FieldError>
          </div>
        )}
      />

      {error ? (
        <p className={styles.error()} role="alert">
          {error}
        </p>
      ) : null}

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
            <span>{t("resendIn", { seconds: remainingSeconds })}</span>
            <span className={styles.timer()}>{formatTimer(remainingSeconds)}</span>
          </>
        ) : (
          <Button
            className={styles.resend()}
            isPending={isPending}
            size="sm"
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
