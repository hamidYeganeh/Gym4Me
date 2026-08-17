import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  FieldError,
  Input,
  Label,
  TextField,
  Typography,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeSlash, Lock1 } from "@repo/icons";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("Admin.ForgotPassword");
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
            <Label>{t("passwordLabel")}</Label>
            <div className={styles.inputWrap()}>
              <Lock1 className={styles.inputIcon()} size={24} />
              <Input
                autoComplete="new-password"
                className={`${styles.input()} ${styles.inputWithSuffix()}`}
                dir="ltr"
                placeholder={t("passwordPlaceholder")}
                ref={field.ref}
              />
              <Button
                isIconOnly
                size="lg"
                type="button"
                variant="ghost"
                aria-label={
                  showPassword ? t("hidePassword") : t("showPassword")
                }
                className={styles.suffixButton()}
                onPress={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeSlash size={24} /> : <Eye size={24} />}
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
            <Label>{t("confirmPasswordLabel")}</Label>
            <div className={styles.inputWrap()}>
              <Lock1 className={styles.inputIcon()} size={24} />
              <Input
                autoComplete="new-password"
                className={styles.input()}
                dir="ltr"
                placeholder={t("passwordPlaceholder")}
                ref={field.ref}
              />
            </div>
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />

      {error ? (
        <Typography className={styles.error()} role="alert">
          {error}
        </Typography>
      ) : null}

      <Button
        className={styles.submit()}
        fullWidth
        isPending={isPending}
        size="lg"
        type="submit"
        variant="primary"
      >
        {t("savePassword")}
      </Button>
    </form>
  );
}
