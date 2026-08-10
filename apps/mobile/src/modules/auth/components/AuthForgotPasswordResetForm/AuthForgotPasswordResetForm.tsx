"use client";

import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  Button,
  FieldError,
  Input,
  Label,
  TextField,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeSlash, Lock1 } from "@repo/icons";
import { useTranslations } from "next-intl";
import {
  evaluatePasswordStrength,
  passwordStrengthMessageKey,
} from "@/modules/auth/lib/password-strength";
import {
  authForgotPasswordResetFormDefaults,
  createAuthForgotPasswordResetFormSchema,
  toAuthForgotPasswordResetPayload,
  type AuthForgotPasswordResetFormValues,
} from "./AuthForgotPasswordResetForm.schema";
import { authForgotPasswordResetFormVariants } from "./AuthForgotPasswordResetForm.styles";
import type { AuthForgotPasswordResetFormProps } from "./AuthForgotPasswordResetForm.types";

export function AuthForgotPasswordResetForm({
  className,
  resetToken,
  error = null,
  isPending = false,
  onSubmit,
}: AuthForgotPasswordResetFormProps) {
  const t = useTranslations("Mobile.ForgotPassword");
  const styles = authForgotPasswordResetFormVariants();
  const [showPassword, setShowPassword] = useState(false);

  const schema = useMemo(
    () =>
      createAuthForgotPasswordResetFormSchema({
        passwordRequired: t("validation.passwordRequired"),
        passwordWeak: t("validation.passwordWeak"),
        confirmMismatch: t("validation.confirmMismatch"),
      }),
    [t],
  );

  const form = useForm<AuthForgotPasswordResetFormValues>({
    resolver: zodResolver(schema),
    defaultValues: authForgotPasswordResetFormDefaults,
  });

  const password = useWatch({ control: form.control, name: "password" }) ?? "";
  const strength = useMemo(
    () => evaluatePasswordStrength(password),
    [password],
  );
  const strengthKey = passwordStrengthMessageKey(strength);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(toAuthForgotPasswordResetPayload(values, resetToken));
  });

  return (
    <form className={styles.form({ className })} onSubmit={handleSubmit}>
      <Controller
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <TextField
            className={styles.field()}
            fullWidth
            isInvalid={fieldState.invalid}
            isRequired
            name={field.name}
            type={showPassword ? "text" : "password"}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label className={styles.label()}>{t("passwordLabel")}</Label>
            <div className={styles.inputWrap()}>
              <Lock1 className={styles.inputIcon()} size={22} />
              <Input
                autoComplete="new-password"
                className={`${styles.input()} ${styles.inputWithSuffix()}`}
                dir="ltr"
                placeholder={t("passwordPlaceholder")}
                ref={field.ref}
              />
              <Button
                aria-label={
                  showPassword ? t("hidePassword") : t("showPassword")
                }
                className={styles.suffixButton()}
                isIconOnly
                size="lg"
                type="button"
                variant="ghost"
                onPress={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeSlash size={22} /> : <Eye size={22} />}
              </Button>
            </div>
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />

      <Controller
        control={form.control}
        name="confirmPassword"
        render={({ field, fieldState }) => (
          <TextField
            className={styles.field()}
            fullWidth
            isInvalid={fieldState.invalid}
            isRequired
            name={field.name}
            type={showPassword ? "text" : "password"}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label className={styles.label()}>
              {t("confirmPasswordLabel")}
            </Label>
            <div className={styles.inputWrap()}>
              <Lock1 className={styles.inputIcon()} size={22} />
              <Input
                autoComplete="new-password"
                className={`${styles.input()} ${styles.inputWithSuffix()}`}
                dir="ltr"
                placeholder={t("passwordPlaceholder")}
                ref={field.ref}
              />
              <Button
                aria-label={
                  showPassword ? t("hidePassword") : t("showPassword")
                }
                className={styles.suffixButton()}
                isIconOnly
                size="lg"
                type="button"
                variant="ghost"
                onPress={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeSlash size={22} /> : <Eye size={22} />}
              </Button>
            </div>
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
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
          <p className={styles.strengthMessage()}>
            {t(`strength.${strengthKey}`)}
          </p>
        ) : null}
      </div>

      {error ? (
        <p className={styles.error()} role="alert">
          {error}
        </p>
      ) : null}

      <Button
        className={styles.submit()}
        fullWidth
        isDisabled={!strength.isValid}
        isPending={isPending}
        size="lg"
        type="submit"
        variant="primary"
      >
        {t("savePassword")}
        <ArrowRight className={styles.submitIcon()} size={20} />
      </Button>
    </form>
  );
}
