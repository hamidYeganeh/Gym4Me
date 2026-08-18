"use client";

import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@heroui/react/button";
import { Checkbox } from "@heroui/react/checkbox";
import { Link } from "@heroui/react/link";
import { Typography } from "@heroui/react/typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "@repo/icons/ArrowRight";
import { PasswordField } from "@repo/ui/kit/PasswordField";
import { useTranslations } from "next-intl";
import { AuthPhoneField } from "@/modules/auth/sections/AuthPhoneField";
import {
  authLoginPasswordFormDefaults,
  createAuthLoginPasswordFormSchema,
  toAuthLoginPasswordPayload,
  type AuthLoginPasswordFormValues,
} from "./AuthLoginPasswordForm.schema";
import { authLoginPasswordFormVariants } from "./AuthLoginPasswordForm.styles";
import type { AuthLoginPasswordFormProps } from "./AuthLoginPasswordForm.types";

export function AuthLoginPasswordForm({
  className,
  isPending = false,
  onForgotPassword,
  onSubmit,
}: AuthLoginPasswordFormProps) {
  const t = useTranslations("Mobile.Auth");
  const styles = authLoginPasswordFormVariants();

  const schema = useMemo(
    () =>
      createAuthLoginPasswordFormSchema({
        phoneRequired: t("validation.phoneRequired"),
        phoneInvalid: t("validation.phoneInvalid"),
        passwordRequired: t("validation.passwordRequired"),
      }),
    [t],
  );

  const form = useForm<AuthLoginPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: authLoginPasswordFormDefaults,
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(toAuthLoginPasswordPayload(values));
  });

  return (
    <form className={styles.form({ className })} onSubmit={handleSubmit}>
      <Controller
        control={form.control}
        name="phone"
        render={({ field, fieldState }) => (
          <AuthPhoneField
            errorMessage={fieldState.error?.message}
            hideLabel
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

      <Controller
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <PasswordField
            autoComplete="current-password"
            errorMessage={fieldState.error?.message}
            hideLabel
            hidePasswordLabel={t("hidePassword")}
            inputRef={field.ref}
            isInvalid={fieldState.invalid}
            isRequired
            label={t("passwordLabel")}
            name={field.name}
            placeholder={t("passwordLabel")}
            showPasswordLabel={t("showPassword")}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          />
        )}
      />

      <div className={styles.row()}>
        <Controller
          control={form.control}
          name="remember"
          render={({ field }) => (
            <Checkbox
              isSelected={field.value}
              name={field.name}
              onBlur={field.onBlur}
              onChange={field.onChange}
            >
              <Checkbox.Content>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Typography className={styles.remember()} type="body-sm">
                  {t("remember")}
                </Typography>
              </Checkbox.Content>
            </Checkbox>
          )}
        />

        {onForgotPassword ? (
          <Link className={styles.forgot()} onPress={onForgotPassword}>
            {t("forgotPassword")}
          </Link>
        ) : null}
      </div>

      <Button
        className={styles.submit()}
        fullWidth
        isPending={isPending}
        size="lg"
        type="submit"
        variant="primary"
      >
        {t("passwordSubmit")}
        <ArrowRight className={styles.submitIcon()} size={22} />
      </Button>
    </form>
  );
}
