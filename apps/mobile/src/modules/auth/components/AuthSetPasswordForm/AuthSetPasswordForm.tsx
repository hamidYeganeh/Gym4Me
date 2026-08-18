"use client";

import { useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "@repo/icons/ArrowRight";
import { PasswordField } from "@repo/ui/kit/PasswordField";
import { useTranslations } from "next-intl";
import {
  evaluatePasswordStrength,
  passwordStrengthMessageKey,
} from "@/modules/auth/lib/password-strength";
import {
  authSetPasswordFormDefaults,
  createAuthSetPasswordFormSchema,
  toAuthSetPasswordPayload,
  type AuthSetPasswordFormValues,
} from "./AuthSetPasswordForm.schema";
import { authSetPasswordFormVariants } from "./AuthSetPasswordForm.styles";
import type { AuthSetPasswordFormProps } from "./AuthSetPasswordForm.types";

export function AuthSetPasswordForm({
  className,
  isPending = false,
  onSubmit,
}: AuthSetPasswordFormProps) {
  const t = useTranslations("Mobile.SetPassword");
  const styles = authSetPasswordFormVariants();

  const schema = useMemo(
    () =>
      createAuthSetPasswordFormSchema({
        passwordRequired: t("validation.passwordRequired"),
        passwordWeak: t("validation.passwordWeak"),
        confirmMismatch: t("validation.confirmMismatch"),
      }),
    [t],
  );

  const form = useForm<AuthSetPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: authSetPasswordFormDefaults,
  });

  const password = useWatch({ control: form.control, name: "password" }) ?? "";
  const strength = useMemo(
    () => evaluatePasswordStrength(password),
    [password],
  );
  const strengthKey = passwordStrengthMessageKey(strength);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(toAuthSetPasswordPayload(values));
  });

  return (
    <form autoComplete="off" className={styles.form({ className })} onSubmit={handleSubmit}>
      <Typography className={styles.notice()} type="body-sm">
        {t("reloginNote")}
      </Typography>

      <Controller
        control={form.control}
        name="currentPassword"
        render={({ field, fieldState }) => (
          <PasswordField
            errorMessage={fieldState.error?.message}
            hidePasswordLabel={t("hidePassword")}
            inputRef={field.ref}
            isInvalid={fieldState.invalid}
            label={t("currentPasswordLabel")}
            name={field.name}
            placeholder={t("currentPasswordPlaceholder")}
            showPasswordLabel={t("showPassword")}
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
            errorMessage={fieldState.error?.message}
            hidePasswordLabel={t("hidePassword")}
            inputRef={field.ref}
            isInvalid={fieldState.invalid}
            isRequired
            label={t("passwordLabel")}
            name={field.name}
            placeholder={t("passwordPlaceholder")}
            showPasswordLabel={t("showPassword")}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          />
        )}
      />

      <Controller
        control={form.control}
        name="confirmPassword"
        render={({ field, fieldState }) => (
          <PasswordField
            errorMessage={fieldState.error?.message}
            hidePasswordLabel={t("hidePassword")}
            inputRef={field.ref}
            isInvalid={fieldState.invalid}
            isRequired
            label={t("confirmPasswordLabel")}
            name={field.name}
            placeholder={t("passwordPlaceholder")}
            showPasswordLabel={t("showPassword")}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          />
        )}
      />

      <div className={styles.strength()} aria-live="polite">
        <div className={styles.strengthBars()}>
          {Array.from({ length: 4 }, (_, index) => (
            <span
              className={`${styles.strengthBar()} ${
                index < strength.segments ? styles.strengthBarActive() : ""
              }`}
              key={index}
            />
          ))}
        </div>
        {password ? (
          <Typography className={styles.strengthMessage()} type="body-sm">
            {t(`strength.${strengthKey}`)}
          </Typography>
        ) : null}
      </div>

      <Button
        className={styles.submit()}
        fullWidth
        isDisabled={!strength.isValid}
        isPending={isPending}
        size="lg"
        type="submit"
        variant="primary"
      >
        {t("submit")}
        <ArrowRight className={styles.submitIcon()} size={20} />
      </Button>
    </form>
  );
}
