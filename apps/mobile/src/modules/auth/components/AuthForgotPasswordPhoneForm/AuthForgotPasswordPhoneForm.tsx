"use client";

import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Key1 } from "@repo/icons/Key1";
import { PhoneField } from "@repo/ui/kit/PhoneField";
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
          <PhoneField
            errorMessage={fieldState.error?.message}
            inputRef={field.ref}
            isInvalid={fieldState.invalid}
            label={t("phoneLabel")}
            name={field.name}
            placeholder={t("phonePlaceholder")}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          />
        )}
      />

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
