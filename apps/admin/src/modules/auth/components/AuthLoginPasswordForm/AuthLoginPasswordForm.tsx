import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "@heroui/react/button";
import { Checkbox } from "@heroui/react/checkbox";
import { Typography } from "@heroui/react/typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "@repo/icons/ArrowRight";
import { Chat } from "@repo/icons/Chat";
import { PasswordField } from "@repo/ui/kit/PasswordField";
import { PhoneField } from "@repo/ui/kit/PhoneField";
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
    <form
      autoComplete="off"
      className={styles.form({ className })}
      onSubmit={handleSubmit}
    >
      <Controller
        control={form.control}
        name="phone"
        render={({ field, fieldState }) => (
          <PhoneField
            errorMessage={fieldState.error?.message}
            hideLabel
            inputRef={field.ref}
            isInvalid={fieldState.invalid}
            label={t("phoneLabel")}
            name={field.name}
            placeholder={t("phonePlaceholder")}
            showCountryChevron
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
        <Chat className={styles.otpIcon()} size={20} />
        {t("otpSubmit")}
      </Button>
    </form>
  );
}
