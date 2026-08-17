"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "@repo/icons/ArrowRight";
import { FormBanner } from "@repo/ui/kit/FormBanner";
import { useTranslations } from "next-intl";
import { AuthPhoneField } from "@/modules/auth/sections/AuthPhoneField";
import {
  authLoginOtpRequestFormDefaults,
  createAuthLoginOtpRequestFormSchema,
  toAuthLoginOtpRequestPayload,
  type AuthLoginOtpRequestFormValues,
} from "./AuthLoginOtpRequestForm.schema";
import { authLoginOtpRequestFormVariants } from "./AuthLoginOtpRequestForm.styles";
import type { AuthLoginOtpRequestFormProps } from "./AuthLoginOtpRequestForm.types";

export function AuthLoginOtpRequestForm({
  className,
  defaultPhone = "",
  error = null,
  isPending = false,
  onSubmit,
  onDismissError,
}: AuthLoginOtpRequestFormProps) {
  const t = useTranslations("Mobile.Otp");
  const tAuth = useTranslations("Mobile.Auth");
  const styles = authLoginOtpRequestFormVariants();

  const schema = useMemo(
    () =>
      createAuthLoginOtpRequestFormSchema({
        phoneRequired: t("validation.phoneRequired"),
        phoneInvalid: t("validation.phoneInvalid"),
      }),
    [t],
  );

  const form = useForm<AuthLoginOtpRequestFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...authLoginOtpRequestFormDefaults,
      phone: defaultPhone,
    },
  });

  useEffect(() => {
    if (!defaultPhone) return;
    form.reset({ phone: defaultPhone });
  }, [defaultPhone, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(toAuthLoginOtpRequestPayload(values));
  });

  return (
    <form className={styles.form({ className })} onSubmit={handleSubmit}>
      <Controller
        control={form.control}
        name="phone"
        render={({ field, fieldState }) => (
          <AuthPhoneField
            errorMessage={fieldState.error?.message}
            inputRef={field.ref}
            isInvalid={fieldState.invalid}
            label={tAuth("phoneLabel")}
            name={field.name}
            placeholder={tAuth("phonePlaceholder")}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          />
        )}
      />

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
        isPending={isPending}
        size="lg"
        type="submit"
        variant="primary"
      >
        {tAuth("otpSubmit")}
        <ArrowRight className={styles.submitIcon()} size={22} />
      </Button>
    </form>
  );
}
