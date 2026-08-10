"use client";

import { useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button, FieldError, InputOTP } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CloseX } from "@repo/icons";
import { useTranslations } from "next-intl";
import {
  normalizeOtpDigits,
  OTP_LENGTH,
  OTP_PATTERN,
} from "@/modules/auth/lib/phone";
import {
  authLoginOtpFormDefaults,
  createAuthLoginOtpFormSchema,
  toAuthLoginOtpPayload,
  type AuthLoginOtpFormValues,
} from "./AuthLoginOtpForm.schema";
import { authLoginOtpFormVariants } from "./AuthLoginOtpForm.styles";
import type { AuthLoginOtpFormProps } from "./AuthLoginOtpForm.types";

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes.toLocaleString("fa-IR")}:${remainder
    .toLocaleString("fa-IR", { minimumIntegerDigits: 2 })
    .replace(/\u200e/g, "")}`;
}

export function AuthLoginOtpForm({
  className,
  phone,
  debugCode = null,
  remainingSeconds,
  notice = null,
  error = null,
  isPending = false,
  isResending = false,
  onSubmit,
  onResend,
  onDismissError,
}: AuthLoginOtpFormProps) {
  const t = useTranslations("Mobile.Otp");
  const tAuth = useTranslations("Mobile.Auth");
  const styles = authLoginOtpFormVariants();

  const schema = useMemo(
    () =>
      createAuthLoginOtpFormSchema({
        codeRequired: t("validation.codeRequired"),
        codeInvalid: t("validation.codeInvalid"),
      }),
    [t],
  );

  const form = useForm<AuthLoginOtpFormValues>({
    resolver: zodResolver(schema),
    defaultValues: authLoginOtpFormDefaults,
  });

  const code = useWatch({ control: form.control, name: "code" }) ?? "";

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(toAuthLoginOtpPayload(values, phone));
  });

  return (
    <form className={styles.form({ className })} onSubmit={handleSubmit}>
      <div className={styles.codeArea()}>
        <Controller
          control={form.control}
          name="code"
          render={({ field, fieldState }) => (
            <div>
              <InputOTP
                autoFocus
                className={styles.otp()}
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

        <div className={styles.resendRow()}>
          {remainingSeconds > 0 ? (
            <p className={styles.resendMuted()}>
              {t("resendIn")}{" "}
              <span className={styles.timer()}>
                {formatTimer(remainingSeconds)}
              </span>
            </p>
          ) : (
            <p className={styles.resendMuted()}>
              {t("didNotReceive")}{" "}
              <Button
                className={styles.resend()}
                isPending={isResending}
                size="sm"
                type="button"
                variant="ghost"
                onPress={onResend}
              >
                {t("resend")}
              </Button>
            </p>
          )}
          {notice ? (
            <p className={styles.notice()} role="status">
              {notice}
            </p>
          ) : null}
        </div>
      </div>

      {debugCode ? (
        <aside className={styles.debugPanel()}>
          <div className={styles.debugCopy()}>
            <span className={styles.debugLabel()}>{t("debugLabel")}</span>
            <code className={styles.debugCode()}>{debugCode}</code>
          </div>
          <Button
            className={styles.debugAction()}
            size="sm"
            type="button"
            variant="ghost"
            onPress={() =>
              form.setValue("code", debugCode, { shouldValidate: true })
            }
          >
            {t("useDebugCode")}
          </Button>
        </aside>
      ) : null}

      {error ? (
        <div className={styles.errorBanner()} role="alert">
          <span>
            {tAuth("errorPrefix")} {error}
          </span>
          {onDismissError ? (
            <Button
              aria-label={tAuth("dismissError")}
              className={styles.errorDismiss()}
              isIconOnly
              size="lg"
              type="button"
              variant="ghost"
              onPress={onDismissError}
            >
              <CloseX size={18} />
            </Button>
          ) : null}
        </div>
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
        {t("submit")}
        <ArrowRight className={styles.submitIcon()} size={22} />
      </Button>
    </form>
  );
}
