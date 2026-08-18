import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "@heroui/react/button";
import { Checkbox } from "@heroui/react/checkbox";
import { FieldError } from "@heroui/react/field-error";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "@repo/icons/ArrowRight";
import { Eye } from "@repo/icons/Eye";
import { EyeSlash } from "@repo/icons/EyeSlash";
import { Lock1 } from "@repo/icons/Lock1";
import { Telephone1 } from "@repo/icons/Telephone1";
import { useTranslations } from "next-intl";
import { routes } from "@/shared/lib/routes";
import {
  authLoginPasswordFormDefaults,
  createAuthLoginPasswordFormSchema,
  toAuthLoginOtpRequestPayload,
  toAuthLoginPasswordPayload,
  type AuthLoginPasswordFormValues,
} from "./AuthLoginPasswordForm.schema";
import { authLoginPasswordFormVariants } from "./AuthLoginPasswordForm.styles";
import type { AuthLoginPasswordFormProps } from "./AuthLoginPasswordForm.types";

export function AuthLoginPasswordForm({
  className,
  error = null,
  isPending = false,
  isOtpPending = false,
  onSubmit,
  onOtpLogin,
}: AuthLoginPasswordFormProps) {
  const t = useTranslations("Admin.Auth");
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

  const handleOtpLogin = async () => {
    const valid = await form.trigger("phone");
    if (!valid) return;

    await onOtpLogin(toAuthLoginOtpRequestPayload(form.getValues("phone")));
  };

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
            <Label>{t("phoneLabel")}</Label>
            <div className={styles.inputWrap()}>
              <Telephone1 className={styles.inputIcon()} size={24} />
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
                autoComplete="current-password"
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

        <RouterLink className={styles.forgot()} to={routes.forgotPassword}>
          {t("forgotPassword")}
        </RouterLink>
      </div>

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
        {t("submit")}
        <ArrowRight className={styles.submitIcon()} size={24} />
      </Button>

      <div className={styles.divider()}>
        <span className={styles.dividerLine()} />
        <span>{t("or")}</span>
        <span className={styles.dividerLine()} />
      </div>

      <Button
        className={styles.otpSubmit()}
        fullWidth
        isPending={isOtpPending}
        size="lg"
        type="button"
        variant="secondary"
        onPress={() => void handleOtpLogin()}
      >
        <Telephone1 size={22} />
        {t("otpSubmit")}
      </Button>
    </form>
  );
}
