"use client";

import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, FieldError, Input, Label, TextField } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Key1, Telephone1 } from "@repo/icons";
import { useTranslations } from "next-intl";
import {
  authForgotPasswordPhoneFormDefaults,
  createAuthForgotPasswordPhoneFormSchema,
  toAuthForgotPasswordPhonePayload,
  type AuthForgotPasswordPhoneFormValues,
} from "./AuthForgotPasswordPhoneForm.schema";
import { authForgotPasswordPhoneFormVariants } from "./AuthForgotPasswordPhoneForm.styles";
import type { AuthForgotPasswordPhoneFormProps } from "./AuthForgotPasswordPhoneForm.types";

export function AuthForgotPasswordPhoneForm({
  className,
  error = null,
  isPending = false,
  onSubmit,
}: AuthForgotPasswordPhoneFormProps) {
  const t = useTranslations("Mobile.ForgotPassword");
  const styles = authForgotPasswordPhoneFormVariants();

  const schema = useMemo(
    () =>
      createAuthForgotPasswordPhoneFormSchema({
        phoneRequired: t("validation.phoneRequired"),
        phoneInvalid: t("validation.phoneInvalid"),
      }),
    [t],
  );

  const form = useForm<AuthForgotPasswordPhoneFormValues>({
    resolver: zodResolver(schema),
    defaultValues: authForgotPasswordPhoneFormDefaults,
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(toAuthForgotPasswordPhonePayload(values));
  });

  return (
    <form className={styles.form({ className })} onSubmit={handleSubmit}>
      <Controller
        control={form.control}
        name="phone"
        render={({ field, fieldState }) => (
          <TextField
            className={styles.field()}
            fullWidth
            isInvalid={fieldState.invalid}
            isRequired
            name={field.name}
            type="tel"
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label className={styles.label()}>{t("phoneLabel")}</Label>
            <div className={styles.inputWrap()}>
              <Telephone1 className={styles.inputIcon()} size={22} />
              <Input
                autoComplete="tel"
                className={styles.input()}
                placeholder={t("phonePlaceholder")}
                ref={field.ref}
              />
            </div>
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
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
        isPending={isPending}
        size="lg"
        type="submit"
        variant="primary"
      >
        {t("sendCode")}
        <Key1 className={styles.submitIcon()} size={20} />
      </Button>
    </form>
  );
}
