"use client";

import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Checkbox,
  FieldError,
  Input,
  Label,
  Link,
  TextField,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CloseX, Eye, EyeSlash, Lock1 } from "@repo/icons";
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
  error = null,
  isPending = false,
  onForgotPassword,
  onSubmit,
  onDismissError,
}: AuthLoginPasswordFormProps) {
  const t = useTranslations("Mobile.Auth");
  const styles = authLoginPasswordFormVariants();
  const [showPassword, setShowPassword] = useState(false);

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
                autoComplete="current-password"
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
                <span className={styles.remember()}>{t("remember")}</span>
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

      {error ? (
        <div className={styles.errorBanner()} role="alert">
          <span>
            {t("errorPrefix")} {error}
          </span>
          {onDismissError ? (
            <Button
              aria-label={t("dismissError")}
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
