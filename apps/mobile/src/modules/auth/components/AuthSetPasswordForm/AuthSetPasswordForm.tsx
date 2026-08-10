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
  authSetPasswordFormDefaults,
  createAuthSetPasswordFormSchema,
  toAuthSetPasswordPayload,
  type AuthSetPasswordFormValues,
} from "./AuthSetPasswordForm.schema";
import { authSetPasswordFormVariants } from "./AuthSetPasswordForm.styles";
import type { AuthSetPasswordFormProps } from "./AuthSetPasswordForm.types";

export function AuthSetPasswordForm({
  className,
  error = null,
  isPending = false,
  onSubmit,
}: AuthSetPasswordFormProps) {
  const t = useTranslations("Mobile.SetPassword");
  const styles = authSetPasswordFormVariants();
  const [showPassword, setShowPassword] = useState(false);

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
    <form className={styles.form({ className })} onSubmit={handleSubmit}>
      <p className={styles.notice()}>{t("reloginNote")}</p>

      <Controller
        control={form.control}
        name="currentPassword"
        render={({ field, fieldState }) => (
          <TextField
            className={styles.field()}
            fullWidth
            isInvalid={fieldState.invalid}
            name={field.name}
            type={showPassword ? "text" : "password"}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label className={styles.label()}>{t("currentPasswordLabel")}</Label>
            <div className={styles.inputWrap()}>
              <Lock1 className={styles.inputIcon()} size={22} />
              <Input
                autoComplete="current-password"
                className={`${styles.input()} ${styles.inputWithSuffix()}`}
                dir="ltr"
                placeholder={t("currentPasswordPlaceholder")}
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
        {t("submit")}
        <ArrowRight className={styles.submitIcon()} size={20} />
      </Button>
    </form>
  );
}
