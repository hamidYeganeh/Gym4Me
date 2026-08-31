"use client";

import { memo, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button } from "@heroui/react/button";
import { FieldError } from "@heroui/react/field-error";
import { Typography } from "@heroui/react/typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "@repo/icons/ArrowRight";
import { InputOTP } from "@repo/ui/kit/InputOTP";
import { useTranslations } from "next-intl";
import { OtpCountdownTimer } from "@/modules/auth/components/OtpCountdownTimer";
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

const AuthLoginOtpResendSection = memo(function AuthLoginOtpResendSection({
  remainingSeconds,
  isResending,
  onResend,
}: Pick<
  AuthLoginOtpFormProps,
  "remainingSeconds" | "isResending" | "onResend"
>) {
  const t = useTranslations("Mobile.Otp");
  const styles = authLoginOtpFormVariants();

  return (
    <div className={styles.resendRow()}>
      {remainingSeconds > 0 ? (
        <p className={styles.resendCountdown()}>
          <span>{t("resendIn")}</span>
          <OtpCountdownTimer remainingSeconds={remainingSeconds} />
        </p>
      ) : (
        <Button
          className={styles.resend()}
          isPending={isResending}
          size="lg"
          type="button"
          variant="ghost"
          onPress={onResend}
        >
          {t("resendPrompt")}
        </Button>
      )}
    </div>
  );
});

export function AuthLoginOtpForm({
  className,
  phone,
  debugCode = null,
  remainingSeconds,
  isPending = false,
  isResending = false,
  onSubmit,
  onResend,
}: AuthLoginOtpFormProps) {
  const t = useTranslations("Mobile.Otp");
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
    <form autoComplete="off" className={styles.form({ className })} onSubmit={handleSubmit}>
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

        <AuthLoginOtpResendSection
          isResending={isResending}
          remainingSeconds={remainingSeconds}
          onResend={onResend}
        />
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
            size="lg"
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

      <Button
        className={styles.submit()}
        fullWidth
        isDisabled={code.length !== OTP_LENGTH}
        isPending={isPending}
        size="lg"
        type="submit"
        variant="primary"
      >
        {t("continue")}
        <ArrowRight className={styles.submitIcon()} size={22} />
      </Button>
    </form>
  );
}
