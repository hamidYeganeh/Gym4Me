"use client";

import { useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button, FieldError, Typography } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "@repo/icons/ArrowRight";
import { FormBanner } from "@repo/ui/kit/FormBanner";
import { InputOTP } from "@repo/ui/kit/InputOTP";
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

        <div className={styles.resendRow()}>
          {remainingSeconds > 0 ? (
            <Typography className={styles.resendMuted()} type="body-sm">
              {t("resendIn")}{" "}
              <Typography
                className={styles.timer()}
                render={({ children, ...domProps }) => (
                  <span {...domProps}>{children}</span>
                )}
                weight="bold"
              >
                {formatTimer(remainingSeconds)}
              </Typography>
            </Typography>
          ) : (
            <Typography className={styles.resendMuted()} type="body-sm">
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
            </Typography>
          )}
          {notice ? (
            <Typography className={styles.notice()} role="status" type="body-sm">
              {notice}
            </Typography>
          ) : null}
        </div>
      </div>

      {debugCode ? (
        <aside className={styles.debugPanel()}>
          <div className={styles.debugCopy()}>
            <Typography className={styles.debugLabel()} type="body-xs" weight="semibold">
              {t("debugLabel")}
            </Typography>
            <Typography.Code className={styles.debugCode()}>{debugCode}</Typography.Code>
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
        <FormBanner
          dismissLabel={tAuth("dismissError")}
          onDismiss={onDismissError}
        >
          {tAuth("errorPrefix")} {error}
        </FormBanner>
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
